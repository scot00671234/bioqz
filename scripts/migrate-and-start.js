#!/usr/bin/env node

import { execSync } from 'child_process';

async function migrateAndStart() {
  try {
    console.log('Running database migrations...');
    execSync('npx drizzle-kit push --verbose', { stdio: 'inherit' });
    console.log('Database migrations completed successfully.');
    
    console.log('Starting production server...');
    execSync('node dist/index.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error during startup:', error);
    process.exit(1);
  }
}

migrateAndStart();