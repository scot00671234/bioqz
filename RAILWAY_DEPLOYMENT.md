# Railway Production Deployment Guide

This guide covers deploying bioqz to Railway with complete database setup, authentication, email confirmation, and all production features.

## 🚀 Quick Start

### Pre-Deployment Validation
Run the production validation script to ensure everything is configured correctly:
```bash
node scripts/validate-production.js
```

### Deployment Steps

1. **Create Railway Project**
   - Connect your GitHub repository to Railway
   - Railway will automatically detect the Node.js project

2. **Add PostgreSQL Database**
   - Go to Railway dashboard → Add Service → Database → PostgreSQL
   - Railway will automatically provide `DATABASE_URL` environment variable

3. **Configure Environment Variables**
   Set these in Railway dashboard under Variables tab:

   **Required:**
   ```
   NODE_ENV=production
   SESSION_SECRET=your-super-secret-session-key-at-least-32-chars
   BASE_URL=https://your-app.railway.app
   ```

   **Optional (for full features):**
   ```
   STRIPE_SECRET_KEY=sk_live_... (for payment features)
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Deploy**
   - Push to your connected repository
   - Railway will automatically build and deploy
   - Database tables are created automatically on first startup

## 🔧 System Components

### Automatic Database Setup
✅ **Tables Created Automatically**: The app uses Drizzle ORM with automatic migrations
- Users table with authentication fields
- Bios table with customization options
- Bio views and link clicks for analytics
- Sessions table for secure authentication

### Authentication System
✅ **Production-Ready Features**:
- Replit OAuth (works without additional setup)
- Google OAuth (requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
- Local username/password authentication
- Secure session management with PostgreSQL storage
- Password hashing with bcrypt

### Email Confirmation System
✅ **Full Email Features**:
- Account verification emails
- Welcome emails for new users
- Professional email templates with bioqz branding
- Gmail SMTP integration (requires app password)
- Graceful fallback when email not configured

### Payment Integration
✅ **Stripe Integration**:
- Pro subscription management
- Secure payment processing
- Webhook handling
- Subscription status tracking

## 📧 Email Setup (Gmail)

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Create password for "Mail"
3. **Set Environment Variables**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

## 🔐 Authentication Setup

### Replit OAuth (Automatic)
- Works out of the box
- No additional configuration needed

### Google OAuth (Optional)
1. **Create Google Cloud Project**
2. **Enable Google+ API**
3. **Create OAuth 2.0 Credentials**
4. **Set Authorized Redirect URIs**:
   ```
   https://your-app.railway.app/api/auth/google/callback
   ```
5. **Add Environment Variables**:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## 💳 Stripe Setup (Optional)

1. **Create Stripe Account**
2. **Get Live API Keys**
3. **Configure Webhooks**:
   - Endpoint: `https://your-app.railway.app/api/webhooks/stripe`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. **Set Environment Variable**:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   ```

## 🗄️ Database Schema

The following tables are automatically created:

### Users Table
- `id` (UUID, primary key)
- `username` (unique)
- `email` (unique)
- `firstName`, `lastName`
- `password` (hashed)
- `googleId` (for OAuth)
- `isPaid` (subscription status)
- `stripeCustomerId`, `stripeSubscriptionId`
- `emailVerified`, `emailVerificationToken`

### Bios Table
- `id` (integer, primary key)
- `userId` (foreign key to users)
- `name`, `description`
- `profilePicture`
- `links` (JSON array)
- `theme`, `layout`, `colorScheme`
- `customCss`

### Analytics Tables
- `bioViews` - Track page views
- `linkClicks` - Track link interactions

## 🚨 Health Checks

Railway health check is configured for `/` endpoint with 120-second timeout.

The app includes:
- Database connection validation
- Automatic migration on startup
- Error handling and logging
- Session management
- CORS configuration

## 🔍 Monitoring

### Logs
Railway automatically captures:
- Application logs
- Database migration logs
- Error logs
- API request logs

### Environment Validation
The app validates:
- Database connection
- Required environment variables
- Email configuration
- Payment integration

## 🛡️ Security Features

- HTTPS enforced in production
- Secure session cookies
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention (Drizzle ORM)
- Password hashing (bcrypt)
- CSRF protection

## 📱 Features Ready for Production

### Core Features
✅ User registration and authentication
✅ Bio page creation and editing
✅ Custom usernames (bioqz.com/username)
✅ Profile picture uploads
✅ Link management
✅ Mobile-responsive design

### Pro Features
✅ Unlimited links
✅ Advanced theme customization
✅ Color schemes and layouts
✅ Custom CSS support
✅ Real-time analytics
✅ Pro-only editor

### Analytics
✅ Page view tracking
✅ Link click tracking
✅ Real-time dashboard
✅ Growth metrics

## 🚀 Post-Deployment Checklist

1. ✅ Verify database tables created
2. ✅ Test user registration
3. ✅ Test email verification
4. ✅ Test bio creation
5. ✅ Test public bio pages
6. ✅ Test Pro upgrade flow
7. ✅ Test payment processing
8. ✅ Test analytics tracking
9. ✅ Test all authentication methods
10. ✅ Verify SSL certificate

## 🆘 Troubleshooting

### Database Issues
- Check DATABASE_URL is set
- Verify PostgreSQL service is running
- Check migration logs in Railway console

### Email Issues
- Verify SMTP credentials
- Check Gmail app password
- Test with a different email provider

### Authentication Issues
- Verify OAuth credentials
- Check redirect URIs
- Ensure SESSION_SECRET is set

### Payment Issues
- Verify Stripe API keys
- Check webhook configuration
- Test in Stripe test mode first

## 📞 Support

For deployment issues:
1. Check Railway service logs
2. Verify all environment variables
3. Test database connectivity
4. Review error messages in console

The application is designed to be production-ready with comprehensive error handling and graceful fallbacks for optional features.