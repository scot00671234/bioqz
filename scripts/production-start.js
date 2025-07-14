#!/usr/bin/env node

// Production startup script for Railway deployment
// This script handles the full production startup process

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function productionStart() {
  try {
    // Ensure DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    console.log('🚀 Starting bioqz production deployment...');
    
    // Step 1: Build the client
    console.log('📦 Building client application...');
    execSync('vite build', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    // Step 2: Run database migrations
    console.log('🗄️ Running database migrations...');
    execSync('npx drizzle-kit push --verbose', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    // Step 3: Start the production server
    console.log('🌐 Starting production server...');
    execSync('npx tsx server/production.ts', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
  } catch (error) {
    console.error('❌ Production startup failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

productionStart();