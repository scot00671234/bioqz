import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertBioSchema, insertUserSchema, users, forgotPasswordSchema, resetPasswordSchema } from "@shared/schema";
import { ZodError } from "zod";
import { db } from "./db";
import { eq } from "drizzle-orm";
import express from "express";
import passport from "passport";
import { randomUUID } from "crypto";
import { hashPassword } from "./auth";
import { sendPasswordResetEmail } from "./email";

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

  // Legacy endpoints for client compatibility
  app.post('/api/login', (req, res, next) => {
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

  app.post('/api/register', async (req, res) => {
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
        emailVerified: true
      });

      res.status(201).json({ message: "Registration successful", user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Password reset routes
  app.post('/api/forgot-password', async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ message: "If the email exists, you will receive a reset link" });
      }

      // Generate reset token
      const resetToken = randomUUID();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Store reset token
      await storage.updatePasswordResetToken(user.id, resetToken, resetExpires);

      // Send reset email
      const emailSent = await sendPasswordResetEmail(email, user.firstName || 'User', resetToken);
      
      if (emailSent) {
        res.json({ message: "If the email exists, you will receive a reset link" });
      } else {
        res.json({ message: "If the email exists, you will receive a reset link" });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post('/api/reset-password', async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      // Hash the new password
      const hashedPassword = await hashPassword(password);
      
      // Reset the password
      const user = await storage.resetPassword(token, hashedPassword);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
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
      console.log(`Attempting to delete account for user: ${userId}`);
      
      // Delete user (this now handles all cascading deletes)
      await storage.deleteUser(userId);
      console.log(`Successfully deleted user: ${userId}`);
      
      // Logout user
      req.logout((err) => {
        if (err) {
          console.error("Error during logout:", err);
          return res.status(500).json({ message: "Account deleted but logout failed" });
        }
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ 
        message: "Failed to delete account", 
        error: error instanceof Error ? error.message : String(error)
      });
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

  // Legacy subscription route - redirect to correct endpoint
  app.all("/api/bios/subscribe", (req, res) => {
    console.log("Legacy /api/bios/subscribe called with method:", req.method);
    console.log("Headers:", req.headers);
    console.log("User agent:", req.get('User-Agent'));
    res.status(301).json({ 
      error: "Endpoint moved", 
      newEndpoint: "/api/get-or-create-subscription",
      redirectUrl: "/subscribe",
      message: "Please use /api/get-or-create-subscription instead"
    });
  });







  // Cancel subscription route
  app.post('/api/cancel-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let subscriptionEndDate = null;

      // If user has a Stripe subscription, cancel it and get the period end date
      if (stripe && user.stripeSubscriptionId && user.stripeCustomerId) {
        try {
          const updatedSubscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
          
          // Get the subscription end date from Stripe
          subscriptionEndDate = new Date(updatedSubscription.current_period_end * 1000);
          console.log(`Subscription will end on: ${subscriptionEndDate}`);
        } catch (stripeError: any) {
          console.error("Error cancelling Stripe subscription:", stripeError);
          // Set end date to end of current month as fallback
          const now = new Date();
          subscriptionEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
      } else {
        // Fallback: set end date to end of current month
        const now = new Date();
        subscriptionEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      // Update user's subscription status with end date
      const updatedUser = await storage.cancelUserSubscription(userId, subscriptionEndDate);

      res.json({ 
        message: "Subscription cancelled successfully", 
        user: updatedUser,
        subscriptionEndDate: subscriptionEndDate
      });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Stripe health check endpoint
  app.get('/api/stripe-status', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.json({ 
          available: false, 
          message: "Stripe not configured - STRIPE_SECRET_KEY missing",
          hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
          hasPublicKey: !!process.env.VITE_STRIPE_PUBLIC_KEY
        });
      }

      // Test Stripe connection
      const customers = await stripe.customers.list({ limit: 1 });
      
      res.json({ 
        available: true, 
        message: "Stripe is properly configured",
        hasSecretKey: true,
        hasPublicKey: !!process.env.VITE_STRIPE_PUBLIC_KEY
      });
    } catch (error: any) {
      console.error("Stripe connection test failed:", error);
      res.json({ 
        available: false, 
        message: `Stripe connection failed: ${error.message}`,
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublicKey: !!process.env.VITE_STRIPE_PUBLIC_KEY
      });
    }
  });

  // Main Stripe subscription route
  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      console.log("=== SUBSCRIPTION REQUEST START ===");
      console.log("User authenticated:", !!req.user);
      console.log("User ID:", req.user?.id);
      console.log("Stripe initialized:", !!stripe);
      console.log("Environment check - STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
      console.log("Environment check - VITE_STRIPE_PUBLIC_KEY exists:", !!process.env.VITE_STRIPE_PUBLIC_KEY);
      
      if (!stripe) {
        console.error("Stripe not initialized. STRIPE_SECRET_KEY:", !!process.env.STRIPE_SECRET_KEY);
        return res.status(503).json({ message: "Payment service not available - Stripe not configured" });
      }
      
      const userId = req.user.id;
      console.log("Creating subscription for user:", userId);
      
      let user = await storage.getUser(userId);
      console.log("User found:", !!user, user?.email);

      if (!user) {
        console.error("User not found in database:", userId);
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

      // First create a product
      const product = await stripe.products.create({
        name: 'bioqz Pro',
        description: 'Unlimited links, custom themes, and analytics',
      });

      // Then create a price for that product
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: 900, // $9.00 in cents
        recurring: {
          interval: 'month',
        },
        product: product.id,
      });

      // Create subscription using the price ID
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: price.id,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe info
      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

      // Safely access client secret
      let clientSecret = null;
      if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
        const invoice = subscription.latest_invoice as any;
        if (invoice.payment_intent && typeof invoice.payment_intent === 'object') {
          const paymentIntent = invoice.payment_intent as any;
          clientSecret = paymentIntent.client_secret;
        }
      }

      if (!clientSecret) {
        console.error('No client secret found in subscription:', JSON.stringify(subscription, null, 2));
        return res.status(500).json({ message: 'Failed to get payment details from Stripe' });
      }

      res.json({
        subscriptionId: subscription.id,
        clientSecret: clientSecret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        stripeError: error.type || 'unknown'
      });
      res.status(500).json({ 
        message: "Failed to create subscription",
        error: error.message 
      });
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
