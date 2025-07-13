#!/usr/bin/env node

/**
 * Production Environment Validation Script for Railway Deployment
 * This script validates that all required components are working for production deployment
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';
import { execSync } from 'child_process';
import { accessSync } from 'fs';
import ws from 'ws';

// Configure WebSocket for Neon database connection
neonConfig.webSocketConstructor = ws;

console.log('🚀 Starting bioqz Production Validation...\n');

// Environment validation
function validateEnvironment() {
  console.log('📋 Validating Environment Variables...');
  
  const required = ['DATABASE_URL'];
  const optional = [
    'SESSION_SECRET',
    'STRIPE_SECRET_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'BASE_URL'
  ];

  const missing = required.filter(env => !process.env[env]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }

  console.log('✅ Required environment variables present');
  
  const presentOptional = optional.filter(env => process.env[env]);
  if (presentOptional.length > 0) {
    console.log(`ℹ️  Optional features configured: ${presentOptional.join(', ')}`);
  }

  return true;
}

// Database validation
async function validateDatabase() {
  console.log('\n🗄️  Validating Database Connection...');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    // Test basic connection
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Database connected successfully at ${result.rows[0].current_time}`);
    
    // Check if tables exist (they should be created by migrations)
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tableNames = tables.rows.map(row => row.table_name);
    const expectedTables = ['users', 'bios', 'bioViews', 'linkClicks', 'sessions'];
    const missingTables = expectedTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`⚠️  Tables not yet created (will be created on first startup): ${missingTables.join(', ')}`);
    } else {
      console.log(`✅ All required tables present: ${tableNames.join(', ')}`);
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Email validation
async function validateEmail() {
  console.log('\n📧 Validating Email Configuration...');
  
  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  
  if (!emailUser || !emailPass) {
    console.log('⚠️  Email not configured - email verification will be disabled');
    return true; // Not required for basic functionality
  }
  
  try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration failed:', error.message);
    console.log('💡 Tip: For Gmail, use an App Password instead of your regular password');
    return false;
  }
}

// Build validation
function validateBuild() {
  console.log('\n🔧 Validating Build Process...');
  
  try {
    // Check if required build files exist
    const requiredFiles = [
      'server/index.ts',
      'shared/schema.ts',
      'drizzle.config.ts',
      'package.json',
      'vite.config.ts'
    ];
    
    for (const file of requiredFiles) {
      try {
        accessSync(file);
      } catch {
        throw new Error(`Required file missing: ${file}`);
      }
    }
    
    console.log('✅ All required build files present');
    
    // Skip TypeScript compilation test in validation (Railway will handle this during build)
    console.log('ℹ️  TypeScript compilation will be tested during Railway build process');
    
    return true;
  } catch (error) {
    console.error('❌ Build validation failed:', error.message);
    return false;
  }
}

// Security validation
function validateSecurity() {
  console.log('\n🔒 Validating Security Configuration...');
  
  let securityScore = 0;
  const checks = [];
  
  // Session secret
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32) {
    checks.push('✅ Strong session secret configured');
    securityScore++;
  } else {
    checks.push('⚠️  Session secret missing or too short (should be 32+ characters)');
  }
  
  // NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    checks.push('✅ Production environment configured');
    securityScore++;
  } else {
    checks.push('⚠️  NODE_ENV not set to production');
  }
  
  // HTTPS check (in production)
  if (process.env.BASE_URL && process.env.BASE_URL.startsWith('https://')) {
    checks.push('✅ HTTPS configured in BASE_URL');
    securityScore++;
  } else if (process.env.NODE_ENV === 'production') {
    checks.push('⚠️  BASE_URL should use HTTPS in production');
  }
  
  checks.forEach(check => console.log(check));
  
  return securityScore >= 2; // At least basic security measures
}

// Main validation function
async function runValidation() {
  const results = [];
  
  results.push(validateEnvironment());
  results.push(await validateDatabase());
  results.push(await validateEmail());
  results.push(validateBuild());
  results.push(validateSecurity());
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('\n📊 Validation Summary:');
  console.log(`✅ Passed: ${passed}/${total} checks`);
  
  if (passed === total) {
    console.log('\n🎉 All validations passed! Ready for Railway deployment.');
    console.log('\n🚀 Next steps:');
    console.log('1. Commit and push your code to GitHub');
    console.log('2. Connect your repository to Railway');
    console.log('3. Add a PostgreSQL service');
    console.log('4. Configure environment variables in Railway dashboard');
    console.log('5. Deploy!');
    return true;
  } else {
    console.log('\n⚠️  Some validations failed. Please fix the issues above before deploying.');
    return false;
  }
}

// Run validation
runValidation()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Validation script failed:', error);
    process.exit(1);
  });