import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBioSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_development');

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.post('/api/users/username', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { username } = insertUserSchema.parse(req.body);
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const user = await storage.upsertUser({
        id: userId,
        username,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
      });

      res.json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating username:", error);
      res.status(500).json({ message: "Failed to update username" });
    }
  });

  // Bio routes
  app.get('/api/bios/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bio = await storage.getBioByUserId(userId);
      res.json(bio);
    } catch (error) {
      console.error("Error fetching bio:", error);
      res.status(500).json({ message: "Failed to fetch bio" });
    }
  });

  app.post('/api/bios', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bioData = insertBioSchema.parse({
        ...req.body,
        userId,
      });

      // Check if bio already exists
      const existingBio = await storage.getBioByUserId(userId);
      let bio;
      
      if (existingBio) {
        bio = await storage.updateBio(userId, bioData);
      } else {
        bio = await storage.createBio(bioData);
      }

      res.json(bio);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error saving bio:", error);
      res.status(500).json({ message: "Failed to save bio" });
    }
  });

  // Public bio route
  app.get('/api/bios/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const bio = await storage.getBioByUsername(username);
      
      if (!bio) {
        return res.status(404).json({ message: "Bio not found" });
      }

      res.json(bio);
    } catch (error) {
      console.error("Error fetching public bio:", error);
      res.status(500).json({ message: "Failed to fetch bio" });
    }
  });

  // Delete user account route
  app.delete('/api/users/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Delete user's bio first
      const existingBio = await storage.getBioByUserId(userId);
      if (existingBio) {
        await storage.deleteBio(userId);
      }
      
      // Delete user
      await storage.deleteUser(userId);
      
      // Logout user
      req.logout(() => {
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Stripe subscription route
  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
          expand: ['payment_intent']
        });

        // Handle the payment_intent properly
        const paymentIntent = (invoice as any).payment_intent;
        const clientSecret = paymentIntent && typeof paymentIntent === 'object' 
          ? paymentIntent.client_secret 
          : null;

        return res.json({
          subscriptionId: subscription.id,
          clientSecret,
        });
      }

      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
      });

      // Create a price if STRIPE_PRICE_ID is not set
      let priceId = process.env.STRIPE_PRICE_ID;
      if (!priceId) {
        const product = await stripe.products.create({
          name: 'QuickBio Pro',
          description: 'Premium bio page features',
        });

        const price = await stripe.prices.create({
          unit_amount: 800, // $8.00
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          product: product.id,
        });

        priceId = price.id;
      }

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      user = await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice.payment_intent as any;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Stripe error:", error);
      return res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
