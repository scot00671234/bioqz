# Railway Deployment Guide for bioqz

## Prerequisites

1. A Railway account
2. A PostgreSQL database provisioned on Railway
3. Your domain or Railway-provided domain

## Environment Variables

Set these environment variables in your Railway project:

### Required
- `DATABASE_URL` - Your PostgreSQL connection string (automatically provided by Railway)
- `NODE_ENV=production`
- `PORT=5000` (Railway will provide this automatically)

### Optional (for full functionality)
- `GOOGLE_CLIENT_ID` - For Google OAuth authentication
- `GOOGLE_CLIENT_SECRET` - For Google OAuth authentication  
- `SESSION_SECRET` - Secure session secret (will auto-generate if not provided)
- `STRIPE_SECRET_KEY` - For payment processing
- `STRIPE_PUBLISHABLE_KEY` - For frontend payment forms

### Replit-specific (only needed when running on Replit)
- `REPLIT_DOMAINS` - Comma-separated list of Replit domains
- `REPL_ID` - Replit project ID
- `ISSUER_URL` - OpenID Connect issuer URL

## Deployment Steps

1. **Create Railway Project**
   ```bash
   railway new bioqz
   cd bioqz
   ```

2. **Add PostgreSQL Database**
   ```bash
   railway add postgresql
   ```

3. **Deploy the Application**
   ```bash
   railway up
   ```

4. **Set Environment Variables** (if needed)
   ```bash
   railway variables set GOOGLE_CLIENT_ID=your_client_id
   railway variables set GOOGLE_CLIENT_SECRET=your_client_secret
   railway variables set STRIPE_SECRET_KEY=your_stripe_key
   ```

## Features

### ✅ Works Out of the Box
- Database connection and automatic migrations
- Static file serving
- API endpoints
- Public bio pages
- Express server with proper error handling

### ⚠️ Requires Configuration
- **Authentication**: Set Google OAuth credentials for login functionality
- **Payments**: Set Stripe credentials for Pro subscription features
- **Custom Domain**: Configure custom domain in Railway dashboard

### 🔧 Graceful Degradation
- Missing Google OAuth: Authentication endpoints return 503 with clear error messages
- Missing Stripe: Payment features are disabled with warnings
- Missing Replit credentials: Replit-specific auth is disabled automatically

## Health Checks

The application includes:
- Automatic database migrations on startup
- Health check endpoint at `/`
- Proper error handling and logging
- Graceful shutdown handling

## Troubleshooting

### Database Issues
- Ensure DATABASE_URL is set correctly
- Check database connection in Railway logs
- Migrations run automatically on startup

### Authentication Issues
- Verify Google OAuth credentials are correct
- Check callback URLs match your domain
- Ensure proper CORS settings for your domain

### Build Issues
- Build process runs `vite build` then `esbuild` for server
- Check for TypeScript errors with `npm run check`
- Verify all dependencies are installed

## Security Considerations

- HTTPS is enforced in production
- Sessions use secure cookies
- Trust proxy settings configured for Railway
- Environment variables are properly isolated
- No sensitive data in logs or client code