# Railway Deployment Guide for bioqz

## Overview
This guide provides step-by-step instructions for deploying bioqz to Railway with automatic PostgreSQL database table creation.

## Prerequisites
- Railway account
- GitHub repository with bioqz code
- Basic understanding of environment variables

## Step 1: Create Railway Project
1. Log in to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your bioqz repository
5. Railway will automatically detect it as a Node.js project

## Step 2: Add PostgreSQL Database
1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provision a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically configured

## Step 3: Configure Environment Variables
In your Railway project settings, add these environment variables:

### Required for Basic Functionality
- `SESSION_SECRET` - Random string for session security (generate with `openssl rand -base64 32`)

### Optional Features (app will work without these)
- `STRIPE_SECRET_KEY` - For payment processing
- `GOOGLE_CLIENT_ID` - For Google OAuth authentication
- `GOOGLE_CLIENT_SECRET` - For Google OAuth authentication
- `SMTP_HOST` - For email features (e.g., smtp.gmail.com)
- `SMTP_PORT` - For email features (e.g., 587)
- `SMTP_USER` - For email features (your email)
- `SMTP_PASS` - For email features (app password)

## Step 4: Deploy
1. Push your code to GitHub
2. Railway will automatically build and deploy
3. The deployment process will:
   - Install dependencies
   - Build the client application with Vite
   - Run database migrations (create tables automatically)
   - Start the production server with tsx (no bundling issues)

## Step 5: Verify Deployment
1. Check the deployment logs for successful migration
2. Visit your Railway app URL
3. Test user registration and basic functionality

## Database Schema
The application will automatically create these tables:
- `users` - User accounts and authentication
- `bios` - User bio pages and content
- `sessions` - Session storage for authentication
- `bio_views` - Analytics for page views
- `link_clicks` - Analytics for link clicks

## Troubleshooting

### Database Migration Issues
If tables aren't created:
1. Check the deployment logs for migration errors
2. Ensure `DATABASE_URL` is set correctly
3. Verify PostgreSQL service is running
4. Check for database connection issues

### Application Errors
- Check environment variables are set correctly
- Review deployment logs for specific errors
- Ensure all dependencies are installed

### Performance Optimization
- Database connection pooling is automatically configured
- Static assets are served efficiently
- Health checks are configured for uptime monitoring

## Production Checklist
- [ ] PostgreSQL database provisioned
- [ ] `DATABASE_URL` environment variable set
- [ ] `SESSION_SECRET` configured
- [ ] Application builds successfully
- [ ] Database migrations run successfully
- [ ] Application starts without errors
- [ ] User registration works
- [ ] Bio page creation works
- [ ] Analytics tracking works

## Security Features
- HTTP-only cookies for sessions
- CSRF protection
- Input validation with Zod
- SQL injection prevention with Drizzle ORM
- Secure session storage in PostgreSQL

## Support
If you encounter issues:
1. Check the deployment logs in Railway dashboard
2. Verify all environment variables are set
3. Test database connectivity
4. Review the application logs for specific errors