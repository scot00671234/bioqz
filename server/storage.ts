import {
  users,
  bios,
  type User,
  type UpsertUser,
  type Bio,
  type InsertBio,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  
  // Bio operations
  getBioByUserId(userId: string): Promise<Bio | undefined>;
  getBioByUsername(username: string): Promise<Bio | undefined>;
  createBio(bio: InsertBio): Promise<Bio>;
  updateBio(userId: string, bio: Partial<InsertBio>): Promise<Bio>;
  deleteBio(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
}

export const storage = new DatabaseStorage();
