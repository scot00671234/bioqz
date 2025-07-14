import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { registerSchema, loginSchema } from "@shared/schema";
import { ZodError } from "zod";
import { sendVerificationEmail, sendWelcomeEmail } from "./email";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Generate a secure random secret if SESSION_SECRET is not provided
  const sessionSecret = process.env.SESSION_SECRET || 
    randomBytes(64).toString('hex');
  
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy for email/password authentication
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password) {
            return done(null, false, { message: "Invalid email or password" });
          }

          if (!user.emailVerified) {
            return done(null, false, { message: "Please verify your email before signing in" });
          }

          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy - only if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists with this Google ID
            let user = await storage.getUserByGoogleId(profile.id);
            
            if (!user) {
              // Check if user exists with this email
              user = await storage.getUserByEmail(profile.emails?.[0]?.value || "");
              
              if (user) {
                // Link Google account to existing user
                await storage.linkGoogleAccount(user.id, profile.id);
              } else {
                // Create new user
                const googleUser = {
                  id: `google_${profile.id}`,
                  email: profile.emails?.[0]?.value || "",
                  firstName: profile.name?.givenName || "",
                  lastName: profile.name?.familyName || "",
                  profileImageUrl: profile.photos?.[0]?.value || null,
                  googleId: profile.id,
                  emailVerified: true, // Google accounts are pre-verified
                };
                user = await storage.upsertUser(googleUser);
              }
            }
            
            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  } else {
    console.warn("Google OAuth credentials not found. Google authentication will be disabled.");
  }

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = await storage.createUser({
        id: userId,
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        emailVerified: false,
      });

      // Generate verification token and set expiration (24 hours)
      const verificationToken = randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await storage.updateEmailVerificationToken(userId, verificationToken, expires);

      // Send verification email
      try {
        const emailSent = await sendVerificationEmail(
          validatedData.email, 
          validatedData.firstName, 
          verificationToken
        );
        
        if (emailSent) {
          res.status(201).json({ 
            message: "Registration successful! Please check your email to verify your account.", 
            requiresVerification: true
          });
        } else {
          // If email fails, still create account but mark as verified (fallback)
          await storage.verifyEmail(verificationToken);
          req.login(newUser, (err) => {
            if (err) {
              return res.status(500).json({ message: "Registration successful but login failed" });
            }
            res.status(201).json({ 
              message: "Registration successful! (Email verification skipped)", 
              user: { ...newUser, password: undefined } 
            });
          });
        }
      } catch (error) {
        console.error("Error sending verification email:", error);
        // Fallback: verify user automatically
        await storage.verifyEmail(verificationToken);
        req.login(newUser, (err) => {
          if (err) {
            return res.status(500).json({ message: "Registration successful but login failed" });
          }
          res.status(201).json({ 
            message: "Registration successful! (Email verification skipped)", 
            user: { ...newUser, password: undefined } 
          });
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ 
          message: "Login successful", 
          user: { ...user, password: undefined } 
        });
      });
    })(req, res, next);
  });

  // Google OAuth routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google", 
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get("/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/auth?error=google_failed" }),
      (req, res) => {
        // Successful authentication, redirect to dashboard
        res.redirect("/");
      }
    );
  } else {
    app.get("/api/auth/google", (req, res) => {
      res.status(503).json({ message: "Google authentication not configured" });
    });
  }

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Email verification route
  app.get("/api/verify-email", async (req, res) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    try {
      const user = await storage.verifyEmail(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      // Send welcome email
      await sendWelcomeEmail(user.email, user.firstName || "");

      // Auto-login the user after verification
      req.login(user, (err) => {
        if (err) {
          console.error("Login after verification error:", err);
          return res.redirect("/auth?verified=true&login=failed");
        }
        res.redirect("/?verified=true");
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Legacy redirect routes
  app.get("/api/login", (req, res) => {
    res.redirect("/auth");
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};