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
import passport from "passport";
import { randomUUID } from "crypto";
import { hashPassword } from "./auth";

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

  // Login endpoint
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login error", error: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err: any) => {
        if (err) {
          return res.status(500).json({ message: "Login error", error: err.message });
        }
        res.json({ message: "Login successful", user });
      });
    })(req, res, next);
  });

  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Validate input
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create new user
      const userId = randomUUID();
      const newUser = await storage.createUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerified: true  // For Railway deployment, skip email verification
      });

      res.status(201).json({ message: "Registration successful", user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // User routes
  app.post('/api/users/username', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { username } = insertUserSchema.parse(req.body);
      
      console.log(`🔄 Username update request: ${userId} -> ${username}`);
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        console.log(`❌ Username ${username} is already taken by user ${existingUser.id}`);
        return res.status(400).json({ message: "Username already taken" });
      }

      // Use direct SQL update to avoid constraint issues
      await db.update(users).set({ 
        username,
        updatedAt: new Date()
      }).where(eq(users.id, userId));
      
      // Get the updated user
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      console.log(`✅ Username updated successfully: ${userId} -> ${user.username}`);

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

  // Cancel subscription route
  app.post('/api/cancel-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If user has a Stripe subscription, cancel it
      if (stripe && user.stripeSubscriptionId && user.stripeCustomerId) {
        try {
          await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
        } catch (stripeError: any) {
          console.error("Error cancelling Stripe subscription:", stripeError);
          // Continue with local cancellation even if Stripe fails
        }
      }

      // Update user's subscription status in database
      const updatedUser = await storage.cancelUserSubscription(userId);

      res.json({ message: "Subscription cancelled successfully", user: updatedUser });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
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

      // Check if user already has an active subscription
      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          if (subscription.status === 'active') {
            return res.json({
              subscriptionId: subscription.id,
              status: 'active',
              message: 'Already subscribed to Pro'
            });
          }
        } catch (error) {
          console.log('Previous subscription not found, creating new one');
        }
      }
      
      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      // Create or retrieve Stripe customer
      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe info
      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Stripe webhook to handle subscription events
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
      // For testing purposes, we'll handle subscription events
      const event = JSON.parse(req.body.toString());
      
      if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        
        if (invoice.subscription && invoice.customer) {
          // Find user by Stripe customer ID and update their payment status
          const userResults = await db.select().from(users).where(eq(users.stripeCustomerId, invoice.customer));
          
          if (userResults.length > 0) {
            await db.update(users)
              .set({ 
                isPaid: true,
                stripeSubscriptionId: invoice.subscription
              })
              .where(eq(users.id, userResults[0].id));
          }
        }
      }
      
      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        
        if (subscription.customer) {
          // Find user by Stripe customer ID and remove their Pro status
          const userResults = await db.select().from(users).where(eq(users.stripeCustomerId, subscription.customer));
          
          if (userResults.length > 0) {
            await db.update(users)
              .set({ 
                isPaid: false,
                stripeSubscriptionId: null
              })
              .where(eq(users.id, userResults[0].id));
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
