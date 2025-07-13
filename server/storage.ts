import {
  users,
  bios,
  bioViews,
  linkClicks,
  type User,
  type UpsertUser,
  type Bio,
  type InsertBio,
  type BioView,
  type LinkClick,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  linkGoogleAccount(userId: string, googleId: string): Promise<void>;
  verifyEmail(token: string): Promise<User | null>;
  updateEmailVerificationToken(userId: string, token: string, expires: Date): Promise<void>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  cancelUserSubscription(userId: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  
  // Bio operations
  getBioByUserId(userId: string): Promise<Bio | undefined>;
  getBioByUsername(username: string): Promise<Bio | undefined>;
  createBio(bio: InsertBio): Promise<Bio>;
  updateBio(userId: string, bio: Partial<InsertBio>): Promise<Bio>;
  deleteBio(userId: string): Promise<void>;

  // Analytics operations
  trackBioView(userId: string, bioId: number, ipAddress?: string, userAgent?: string, referrer?: string): Promise<void>;
  trackLinkClick(userId: string, bioId: number, linkUrl: string, linkTitle?: string, ipAddress?: string, userAgent?: string, referrer?: string): Promise<void>;
  getAnalytics(userId: string): Promise<{
    totalViews: number;
    totalClicks: number;
    clickRate: number;
    weeklyGrowth: number;
    topLinks: Array<{ title: string; clicks: number; url: string }>;
    dailyViews: Array<{ date: string; views: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    await db
      .update(users)
      .set({ googleId, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async verifyEmail(token: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));

    if (!user || !user.emailVerificationExpires) {
      return null;
    }

    // Check if token is expired
    if (new Date() > user.emailVerificationExpires) {
      return null;
    }

    // Verify the email
    const [updatedUser] = await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return updatedUser;
  }

  async updateEmailVerificationToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        isPaid: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async cancelUserSubscription(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isPaid: false,
        stripeSubscriptionId: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Bio operations
  async getBioByUserId(userId: string): Promise<Bio | undefined> {
    const [bio] = await db.select().from(bios).where(eq(bios.userId, userId));
    return bio;
  }

  async getBioByUsername(username: string): Promise<Bio | undefined> {
    const [result] = await db
      .select({
        id: bios.id,
        userId: bios.userId,
        name: bios.name,
        description: bios.description,
        avatarUrl: bios.avatarUrl,
        profilePicture: bios.profilePicture,
        links: bios.links,
        createdAt: bios.createdAt,
        updatedAt: bios.updatedAt,
      })
      .from(bios)
      .innerJoin(users, eq(bios.userId, users.id))
      .where(eq(users.username, username));
    return result;
  }

  async createBio(bio: InsertBio): Promise<Bio> {
    const [newBio] = await db.insert(bios).values(bio).returning();
    return newBio;
  }

  async updateBio(userId: string, bioData: Partial<InsertBio>): Promise<Bio> {
    const [updatedBio] = await db
      .update(bios)
      .set({
        ...bioData,
        updatedAt: new Date(),
      })
      .where(eq(bios.userId, userId))
      .returning();
    return updatedBio;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async deleteBio(userId: string): Promise<void> {
    await db.delete(bios).where(eq(bios.userId, userId));
  }

  // Analytics operations
  async trackBioView(userId: string, bioId: number, ipAddress?: string, userAgent?: string, referrer?: string): Promise<void> {
    await db.insert(bioViews).values({
      userId,
      bioId,
      ipAddress,
      userAgent,
      referrer,
    });
  }

  async trackLinkClick(userId: string, bioId: number, linkUrl: string, linkTitle?: string, ipAddress?: string, userAgent?: string, referrer?: string): Promise<void> {
    await db.insert(linkClicks).values({
      userId,
      bioId,
      linkUrl,
      linkTitle,
      ipAddress,
      userAgent,
      referrer,
    });
  }

  async getAnalytics(userId: string): Promise<{
    totalViews: number;
    totalClicks: number;
    clickRate: number;
    weeklyGrowth: number;
    topLinks: Array<{ title: string; clicks: number; url: string }>;
    dailyViews: Array<{ date: string; views: number }>;
  }> {
    // Get total views
    const [viewsResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bioViews)
      .where(eq(bioViews.userId, userId));

    const totalViews = viewsResult?.count || 0;

    // Get total clicks
    const [clicksResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(linkClicks)
      .where(eq(linkClicks.userId, userId));

    const totalClicks = clicksResult?.count || 0;

    // Calculate click rate
    const clickRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    // Get weekly growth (last 7 days vs previous 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [thisWeekViews] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bioViews)
      .where(and(
        eq(bioViews.userId, userId),
        gte(bioViews.viewedAt, weekAgo)
      ));

    const [lastWeekViews] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bioViews)
      .where(and(
        eq(bioViews.userId, userId),
        gte(bioViews.viewedAt, twoWeeksAgo),
        sql`${bioViews.viewedAt} < ${weekAgo}`
      ));

    const thisWeekCount = thisWeekViews?.count || 0;
    const lastWeekCount = lastWeekViews?.count || 0;
    const weeklyGrowth = lastWeekCount > 0 ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100 : 0;

    // Get top performing links
    const topLinksResult = await db
      .select({
        url: linkClicks.linkUrl,
        title: linkClicks.linkTitle,
        clicks: sql<number>`COUNT(*)`
      })
      .from(linkClicks)
      .where(eq(linkClicks.userId, userId))
      .groupBy(linkClicks.linkUrl, linkClicks.linkTitle)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(5);

    const topLinks = topLinksResult.map(link => ({
      title: link.title || 'Unknown',
      clicks: link.clicks,
      url: link.url
    }));

    // Get daily views for last 7 days
    const dailyViewsResult = await db
      .select({
        date: sql<string>`DATE(${bioViews.viewedAt})`,
        views: sql<number>`COUNT(*)`
      })
      .from(bioViews)
      .where(and(
        eq(bioViews.userId, userId),
        gte(bioViews.viewedAt, weekAgo)
      ))
      .groupBy(sql`DATE(${bioViews.viewedAt})`)
      .orderBy(sql`DATE(${bioViews.viewedAt})`);

    // Fill in missing days with 0 views
    const dailyViews = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const existing = dailyViewsResult.find(d => d.date === dateStr);
      dailyViews.push({
        date: dayName,
        views: existing?.views || 0
      });
    }

    return {
      totalViews,
      totalClicks,
      clickRate: Math.round(clickRate * 100) / 100,
      weeklyGrowth: Math.round(weeklyGrowth * 100) / 100,
      topLinks,
      dailyViews
    };
  }
}

export const storage = new DatabaseStorage();
