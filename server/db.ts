import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// For development, use a local database URL if not provided  
const databaseUrl = process.env.DATABASE_URL || 'postgresql://runner@localhost:5432/bioqz?host=/tmp';

console.log('Using database URL:', databaseUrl.replace(/\/\/[^:]+:[^@]+@/, '//[credentials]@'));

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle({ client: pool, schema });