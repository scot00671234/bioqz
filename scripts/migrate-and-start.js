#!/usr/bin/env node

import { execSync } from 'child_process';

async function migrateAndStart() {
  try {
    // Ensure DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    console.log('Running database migrations...');
    
    // Use drizzle-kit push to create/update tables
    execSync('npx drizzle-kit push --verbose', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    console.log('Database migrations completed successfully.');
    
    console.log('Starting production server...');
    execSync('npm start', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('Error during startup:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

migrateAndStart();