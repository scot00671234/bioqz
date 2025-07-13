import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertBioSchema, insertUserSchema, users } from "@shared/schema";
import { ZodError } from "zod";
import { db } from "./db";
import { eq } from "drizzle-orm";
import express from "express";

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
} else {
  console.warn('STRIPE_SECRET_KEY not set. Payment features will be disabled.');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.post('/api/users/username', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { username } = insertUserSchema.parse(req.body);
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Use direct SQL update to avoid constraint issues
      await db.update(users).set({ username }).where(eq(users.id, userId));
      
      // Get the updated user
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      res.json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating username:", error);
      res.status(500).json({ message: "Failed to update username" });
    }
  });

  // Analytics routes
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const analytics = await storage.getAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Bio routes
  app.get('/api/bios/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bio = await storage.getBioByUserId(userId);
      res.json(bio);
    } catch (error) {
      console.error("Error fetching bio:", error);
      res.status(500).json({ message: "Failed to fetch bio" });
    }
  });

  app.post('/api/bios', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

      // Track bio view
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      const referrer = req.get('Referer');
      
      try {
        await storage.trackBioView(bio.userId, bio.id, ipAddress, userAgent, referrer);
      } catch (trackError) {
        console.error("Error tracking bio view:", trackError);
        // Don't fail the request if tracking fails
      }

      res.json(bio);
    } catch (error) {
      console.error("Error fetching public bio:", error);
      res.status(500).json({ message: "Failed to fetch bio" });
    }
  });

  // Track link clicks
  app.post('/api/track-click', async (req, res) => {
    try {
      const { userId, bioId, linkUrl, linkTitle } = req.body;
      
      if (!userId || !bioId || !linkUrl) {
        return res.status(400).json({ message: "userId, bioId and linkUrl are required" });
      }

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      const referrer = req.get('Referer');
      
      await storage.trackLinkClick(userId, bioId, linkUrl, linkTitle, ipAddress, userAgent, referrer);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking link click:", error);
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  // Delete user account route
  app.delete('/api/users/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
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

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service not available" });
      }
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });



  // Instant Pro upgrade route
  app.post('/api/upgrade-to-pro', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Use SQL to directly update the user's paid status
      await db.update(users).set({ isPaid: true }).where(eq(users.id, userId));
      
      // Get the updated user
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      res.json({ message: "Pro features activated", user });
    } catch (error: any) {
      console.error("Error upgrading to Pro:", error);
      res.status(500).json({ message: "Failed to upgrade to Pro" });
    }
  });

  // Stripe subscription route
  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service not available" });
      }
      
      const userId = req.user.id;
      let user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(user.stripeSubscriptionId);
        
        return res.json({
          subscriptionId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
        });
      }
      
      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
      });

      // Create a simple payment intent for testing
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 900, // $9.00 in cents
        currency: 'usd',
        customer: customer.id,
        setup_future_usage: 'off_session',
      });

      await storage.updateUserStripeInfo(userId, customer.id, paymentIntent.id);

      res.json({
        subscriptionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Stripe webhook to handle payment success
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
      // For testing purposes, we'll handle payment intent succeeded events
      const event = JSON.parse(req.body.toString());
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        if (paymentIntent.customer) {
          // Find user by Stripe customer ID and update their payment status
          const userResults = await db.select().from(users).where(eq(users.stripeCustomerId, paymentIntent.customer));
          
          if (userResults.length > 0) {
            await storage.updateUserStripeInfo(userResults[0].id, paymentIntent.customer, paymentIntent.id);
          }
        }
      }
      
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(400).send('Webhook Error');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
