import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // For email/password auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  isPaid: boolean("is_paid").default(false),
  subscriptionEndDate: timestamp("subscription_end_date"), // When subscription actually ends
  isDemoMode: boolean("is_demo_mode").default(false),
  googleId: varchar("google_id"), // For Google OAuth
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bio storage table
export const bios = pgTable("bios", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  avatarUrl: varchar("avatar_url"),
  profilePicture: varchar("profile_picture"),
  links: jsonb("links").default([]),
  theme: jsonb("theme").default({}), // Pro feature: custom theme
  layout: varchar("layout").default("default"), // Pro feature: layout type
  colorScheme: varchar("color_scheme").default("default"), // Pro feature: color scheme
  customCss: text("custom_css"), // Pro feature: custom CSS
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics tables
export const bioViews = pgTable("bio_views", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bioId: serial("bio_id").notNull().references(() => bios.id),
  viewedAt: timestamp("viewed_at").defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  referrer: varchar("referrer"),
});

export const linkClicks = pgTable("link_clicks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bioId: serial("bio_id").notNull().references(() => bios.id),
  linkUrl: varchar("link_url").notNull(),
  linkTitle: varchar("link_title"),
  clickedAt: timestamp("clicked_at").defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  referrer: varchar("referrer"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertBioSchema = createInsertSchema(bios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBio = z.infer<typeof insertBioSchema>;
export type Bio = typeof bios.$inferSelect;
export type BioView = typeof bioViews.$inferSelect;
export type LinkClick = typeof linkClicks.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export const authUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
