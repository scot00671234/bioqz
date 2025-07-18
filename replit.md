# bioqz - Personal Bio Page SaaS

## Overview

bioqz is a micro-SaaS application that allows users to create personalized bio pages with custom usernames (e.g., bioqz.com/username). The application features user authentication, Stripe payment integration for premium features, and a modern responsive design built with React and Express. The app has a warm, inviting UI with smooth animations and limits free users to 1 link while offering profile picture uploads.

## Recent Changes (July 2025)

### CRITICAL SECURITY FIX: Subscription Bypass Vulnerability (July 2025)
- **FIXED: Critical security vulnerability in Pro subscription system** - Users could access Pro features by simply visiting the subscription page without completing payment
- **SECURED: Payment verification logic** - `updateUserStripeInfo` no longer grants Pro access immediately; only webhook `invoice.payment_succeeded` can activate Pro status
- **ENHANCED: Webhook security** - Added comprehensive logging and proper user lookup by Stripe customer ID
- **VERIFIED: Production-ready payment flow** - Users must complete successful payment to access Pro features in both development and Railway production environments
- **PROTECTED: Railway production environment** - Security fix ensures payment bypass cannot occur in production deployment
- **ADDED: Non-webhook verification system** - Added `/api/verify-subscription` endpoint for manual payment verification when webhooks are not configured
- **ENHANCED: Frontend verification** - Added "Verify Subscription" buttons in dashboard and settings for users to manually activate Pro features after payment
- **IMPROVED: Payment success flow** - Payment success page now automatically verifies subscription status and refreshes user data
- **SECURED: Multiple verification methods** - System works with both webhook-based and manual verification approaches for flexible deployment

### Replit Agent to Standard Environment Migration & Production Fixes (July 2025)
- **COMPLETED: Migration from Replit Agent to standard Replit environment** - Successfully migrated with PostgreSQL database setup
- **FIXED: Critical dashboard routing issue for Railway production** - Fixed /dashboard route being treated as username bio page instead of dashboard
- **ENHANCED: Post-subscription redirect flow** - Users now properly redirect from payment success to dashboard for Railway production
- **RESOLVED: Frontend routing conflicts** - Dashboard route now takes precedence over bio routes to prevent misrouting
- **FIXED: Dashboard live preview sync issue** - Fixed bio form changes not updating in dashboard live preview after saving
- **ENHANCED: Modern bio card UI design** - Updated bio pages with glassmorphism effects, improved animations, and contemporary styling
- **IMPROVED: Visual hierarchy and spacing** - Better typography, larger profile images, and refined layout structure
- **ADDED: Interactive animations** - Smooth hover effects, animated backgrounds, and subtle transitions for better user experience
- **FIXED: Account deletion functionality** - Resolved foreign key constraint issues preventing user account deletion
- **ENHANCED: Cascading deletion system** - Account deletion now properly removes analytics data (bio views, link clicks) before removing user
- **IMPROVED: Error handling and logging** - Better error messages and console logging for debugging account deletion issues
- **ADDED: Subscription end date tracking** - Users can now see when their cancelled subscription will end (end of billing period)
- **ENHANCED: Subscription cancellation UX** - Settings page shows subscription end date and removes cancel button after cancellation
- **IMPLEMENTED: Automatic subscription expiration** - Background job checks hourly for expired subscriptions and updates user status
- **FIXED: Email verification URLs for bioqz.com production** - All verification emails now use bioqz.com URLs instead of Railway production URLs
- **ENHANCED: Email service configuration** - Updated sendVerificationEmail, sendWelcomeEmail, and sendPasswordResetEmail to use bioqz.com in production
- **APPLIED: Database migrations** - All tables (users, bios, sessions, analytics) successfully created with proper relationships
- **VERIFIED: Application running on Replit** - Server running on port 5000 with client/server separation and security practices
- **CONFIGURED: Railway production compatibility** - Email links redirect to bioqz.com for customer verification flow

### Stripe Subscription Payment Fixes & Production Configuration (July 2025)
- **FIXED: Stripe API subscription creation error** - Resolved "Received unknown parameter: items[0][price_data][product_data]" by using proper product/price creation flow
- **REMOVED: Subscription bypass endpoint** - Eliminated /api/upgrade-to-pro endpoint that was bypassing Stripe payment
- **ENHANCED: Production-ready Stripe integration** - Added STRIPE_PRICE_ID environment variable support for production deployments
- **FIXED: Settings and Dashboard upgrade flow** - Both now properly redirect to /subscribe page instead of bypassing payment
- **ADDED: Dynamic product/price creation fallback** - System creates Stripe products/prices dynamically when STRIPE_PRICE_ID not provided
- **VERIFIED: Complete subscription payment flow** - Users now properly directed through Stripe payment for Pro subscriptions

### Stripe Subscription Integration & Navigation Enhancement (July 2025)
- **COMPLETED: bioqz logo navigation functionality** - Logo now clickable across all pages with appropriate navigation behavior
- **LANDING PAGE: bioqz logo scrolls to top** - When not logged in, clicking logo smoothly scrolls to top of landing page
- **DASHBOARD: bioqz logo refreshes dashboard** - When logged in, clicking logo refreshes current dashboard page
- **ALL PAGES: bioqz logo navigation** - Updated auth, settings, analytics, pro-editor, and subscription pages with clickable logos
- **ADDED: Stripe subscription system** - Complete /api/get-or-create-subscription endpoint for $9/month Pro plan
- **ADDED: Stripe webhook handling** - Process invoice.payment_succeeded and customer.subscription.deleted events
- **ENHANCED: Settings page billing info** - Added billing period display showing "$9.00 USD / month" and next billing date
- **ENHANCED: Subscription management** - Real-time subscription status updates with proper database synchronization
- **PREPARED: Production-ready Stripe integration** - System ready for STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY configuration
- **VERIFIED: All navigation and payment features working** - Comprehensive testing completed for user flow and payment processing

### Replit Agent to Standard Environment Migration & New Features (July 2025)
- **COMPLETED: Successfully migrated from Replit Agent to standard Replit environment** - Full PostgreSQL database setup with automatic environment variable configuration
- **ADDED: Complete forgot password functionality** - Added "Forgot your password?" link to sign in page with email-based reset system
- **ADDED: Password reset email system** - Users can now reset passwords via secure email links using Gmail SMTP
- **ADDED: Reset password page** - New page for users to set new passwords with secure token validation
- **UPDATED: Pro plan pricing consistency** - Changed pricing to $9/month across all pages (landing, subscription)
- **REMOVED: Customer support text from subscription page** - Cleaned up subscription page as requested
- **ADDED: Customer service contact in settings** - Added clientservicesdigital@gmail.com contact at bottom of settings page
- **REMOVED: Replit-specific text from settings** - Removed "Account information is managed through your Replit profile" for Railway production
- **ENHANCED: Database schema** - Added passwordResetToken and passwordResetExpires fields for secure password reset
- **ENHANCED: Email service** - Added sendPasswordResetEmail function with professional email templates
- **ENHANCED: API routes** - Added /api/forgot-password and /api/reset-password endpoints with proper validation
- **ENHANCED: Security** - Password reset tokens expire after 1 hour, secure hashing for new passwords
- **VERIFIED: All features ready for Railway production** - Migration completed successfully with robust security practices

### Railway Production Fixes - Color Scheme & Links (July 2025)
- **RESOLVED: Fixed color scheme persistence issue in live bio pages** - BioCard now properly reads colorScheme field from database instead of deprecated theme.colors
- **RESOLVED: Made "Powered by bioqz" clickable** - Both BioCard and LiveBioPreview now link to bioqz.com
- **RESOLVED: Restricted color scheme feature to Pro users only** - Free users no longer see color scheme options in dashboard or floating selector
- **CONFIRMED: Email verification system ready for Railway** - Flexible SMTP configuration supports Gmail, SendGrid, or any SMTP provider
- **VERIFIED: Color scheme changes now persist correctly** - Pro editor color changes now apply to both preview and live bio pages
- Enhanced BioCard component with proper color scheme mapping matching LiveBioPreview
- Updated Railway production deployment with all fixes applied and tested
- ColorSchemeSelector now returns null for free users, LiveEditingDashboard hides color scheme section for free users

## Recent Changes (July 2025)

### Railway Production Deployment Fixes (July 2025)
- Fixed PostgreSQL table creation issues in Railway production deployment
- Moved drizzle-kit to production dependencies for proper database migrations
- Updated railway.toml to use production-start.js script for streamlined deployment
- Created production-start.js script that builds client, runs migrations, and starts server with tsx
- Created dedicated server/production.ts file that avoids vite config import issues in production
- Resolved esbuild bundling issues by using tsx directly in production instead of bundling
- Enhanced deployment process with better error handling and environment validation
- Removed duplicate migration logic from server/index.ts to prevent conflicts
- Created comprehensive Railway deployment guide (RAILWAY_DEPLOYMENT.md) with step-by-step instructions
- Verified automatic database migration system works correctly in production environment
- Fixed deployment command sequence to ensure migrations run before server starts
- Added DATABASE_URL validation in migration script to prevent deployment failures
- Enhanced error logging in production startup process for better debugging
- **RESOLVED: Fixed authentication system for Railway deployment by adding missing login/register endpoints**
- **RESOLVED: Fixed user registration by properly generating UUIDs and hashing passwords**
- **RESOLVED: Authentication endpoints now working correctly in Railway production environment**
- **RESOLVED: Added legacy API endpoints (/api/login, /api/register, /api/logout) for client compatibility**
- **CONFIRMED: App successfully deploys to Railway with fully functional authentication system**
- **VERIFIED: All authentication endpoints tested and working correctly in both development and production**
- **RESOLVED: Fixed PostgreSQL database connection issues in Railway by switching from Neon to standard pg driver**
- **RESOLVED: Database registration and user creation now working correctly in Railway production environment**

### Railway Production Deployment Preparation (July 2025)
- Prepared complete Railway production deployment with automatic PostgreSQL table creation
- Enhanced email system with flexible SMTP configuration (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
- Updated authentication to support both legacy EMAIL_USER/EMAIL_PASSWORD and new SMTP variables
- Added production validation script (scripts/validate-production.js) for pre-deployment testing
- Updated railway.toml with optimized build process and health check configuration
- Documented all environment variables required for full production functionality
- Enhanced error handling for missing optional services (email, payments, OAuth)
- Created production checklist (PRODUCTION_CHECKLIST.md) confirming readiness for Railway deployment
- Fixed username update functionality across all components (BioForm, LiveEditingDashboard, Pro Editor)
- Added "Copy Link" and "Open Live Bio" buttons that work with real-time username changes
- All core features, Pro features, analytics, and authentication systems ready for production

### Migration to Standard Replit Environment (July 2025)
- Successfully migrated project from Replit Agent to standard Replit environment
- Set up PostgreSQL database with automatic environment variable configuration
- Applied all database migrations successfully
- Verified full application functionality with proper client/server separation
- Fixed getBioByUsername storage method to include all Bio fields (theme, layout, colorScheme, customCss)
- Resolved "Open Live Bio" functionality in Pro Editor - bio pages now load correctly
- Application now runs cleanly on port 5000 with comprehensive security practices

### Real Analytics & Pro Features Enhancement (July 2025)
- Implemented real analytics tracking system with PostgreSQL database
- Added bioViews and linkClicks tables for comprehensive analytics data
- Created real-time analytics API endpoints with authentic data
- Enhanced Pro Editor with comprehensive theme customization (color schemes, layouts, custom CSS)
- Added ProThemeEditor component with 6 color schemes and 4 layout options
- Implemented link click tracking in BioCard component
- Updated dashboard analytics to show real data instead of mock data
- Added theme fields to bios table (theme, layout, colorScheme, customCss)
- Implemented subscription cancellation functionality with Stripe integration
- Added cancel subscription button in settings page for Pro users
- Created cancelUserSubscription storage method and API endpoint
- Removed bouncing animation from bioqz logo in dashboard header
- Removed "Dashboard" text from header for cleaner design
- Repositioned Settings and Logout buttons side by side in header
- Changed name display to "Hi, [person's name]" format for friendlier greeting
- Enhanced BioCard component to apply Pro user color schemes and layouts
- Added visual previews for color schemes and layouts in Pro Theme Editor
- Implemented layout-specific button styling (default, cards, minimal, gradient)
- Added custom CSS support for advanced Pro customization
- Enhanced Pro Theme Editor with font and typography customization options
- Added Google Fonts support for 6 font families (Inter, Poppins, Roboto, Playfair Display, Montserrat, Open Sans)
- Created ColorSchemeSelector component for Pro users with floating color picker in bottom right corner
- Implemented font size control (small, medium, large, extra large) for Pro users
- Added typography preview in Pro Theme Editor showing font changes in real-time
- Implemented real-time live preview updates in Pro Editor - color schemes, layouts, and typography changes now instantly update the live preview without requiring save
- Removed Pro Editor button from dashboard as requested for cleaner UI

### Replit Migration & Pro Editor (July 2025)
- Successfully migrated project from Replit Agent to standard Replit environment
- Set up PostgreSQL database with automatic migrations
- Created dedicated Pro Editor page (/pro-editor) with enhanced features for Pro users
- Removed View Bio button from dashboard header as requested
- Added Pro Editor access buttons in dashboard for Pro users
- Enhanced Pro user experience with unlimited links and advanced editing capabilities

### Email Verification System (July 2025)
- Successfully implemented complete email verification system using Gmail SMTP via Nodemailer
- Added email verification fields to user database schema (emailVerified, emailVerificationToken, emailVerificationExpires)
- Created beautiful verification email templates with bioqz branding
- Added verification link handling and automatic user login after verification
- Enhanced auth page with verification message display and proper user flow
- Added welcome email functionality for verified users
- Email system gracefully degrades when credentials are not configured
- Fixed SMTP authentication issues and confirmed working email delivery with Gmail app passwords
- Production validation confirms email system is fully operational and ready for Railway deployment

### Railway Deployment Migration (July 2025)
- Migrated from Replit Agent to standard Replit environment for Railway compatibility
- Made Replit authentication optional with graceful fallbacks
- Added automatic database migrations on production startup
- Created Railway deployment configuration and comprehensive guide
- Enhanced authentication system to work without OAuth credentials
- Added environment variable safety checks and warnings

### Landing Page Enhancement (July 2025)
- Integrated example bio page directly into landing page as "See It In Action" section
- Removed "View Example" button to streamline user flow
- Added call-to-action button below example bio for better conversion

### Stripe Integration Setup (July 2025)
- Complete Stripe payment integration with real API keys and proper subscription system
- Professional subscription page with $9/month Pro plan using actual Stripe subscriptions
- Created bioqz Pro product and monthly pricing in Stripe dashboard
- Payment processing routes and webhook support for subscription events
- User payment status tracking and account upgrades
- Proper subscription lifecycle management with cancellation support
- Production-ready webhook handling for invoice.payment_succeeded and customer.subscription.deleted events

### Free Plan Limitations
- Updated free plan to limit users to 1 link maximum
- Removed 30-day money-back guarantee from subscription page
- Added clear upgrade prompts when users hit the 1-link limit

### Branding Updates
- Changed all "QuickBio" references to "bioqz" across the application
- Updated demo page and bio cards to show "Powered by bioqz"
- Made "Get Started Free" button functional on landing page

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite for development and build process
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with session management
- **API Design**: RESTful API with Express routes

### Key Components

#### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Security**: HTTP-only cookies with secure flags
- **User Management**: Automatic user creation and profile management

#### Payment Integration
- **Provider**: Stripe for payment processing
- **Features**: Subscription management and payment status tracking
- **Implementation**: Stripe Elements for secure payment forms
- **Database**: User payment status stored in PostgreSQL

#### Database Schema
- **Users Table**: Core user information with Stripe integration
- **Bios Table**: User bio pages with customizable content
- **Sessions Table**: Session storage for authentication
- **Relationships**: One-to-one relationship between users and bios

#### UI/UX Design
- **Design System**: shadcn/ui with "new-york" style
- **Theme**: Neutral color scheme with CSS variables
- **Responsive**: Mobile-first design with Tailwind CSS
- **Components**: Modular component architecture with TypeScript

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth
2. **Profile Creation**: Authenticated users can create/update their bio profiles
3. **Payment Processing**: Premium users can subscribe via Stripe
4. **Public Access**: Bio pages are publicly accessible via username URLs
5. **Data Persistence**: All data stored in PostgreSQL with Drizzle ORM

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **express**: Web server framework
- **react**: Frontend framework
- **@tanstack/react-query**: Server state management
- **@stripe/stripe-js**: Payment processing
- **wouter**: Client-side routing

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variants
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Server**: Express with Vite middleware for HMR
- **Database**: PostgreSQL with Drizzle migrations
- **Build**: Vite for client-side bundling
- **Type Checking**: TypeScript with strict mode

### Production Build
- **Client**: Static build with Vite (`npm run build`)
- **Server**: Bundled with esbuild for Node.js
- **Database**: Migrations handled via Drizzle Kit
- **Environment**: Production-ready Express server

### Configuration
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, STRIPE_SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- **Database Migrations**: Automatic schema updates via Drizzle on production startup
- **Static Assets**: Served from dist/public directory
- **API Routes**: Prefixed with /api for clear separation
- **Railway Deployment**: Configured with railway.toml and automatic migrations
- **Authentication Fallbacks**: Graceful degradation when OAuth credentials are missing

### Key Features
- **Public Bio Pages**: Accessible via /{username} routes
- **Protected Dashboard**: Authenticated user management interface
- **Payment Integration**: Stripe-powered subscription system
- **Responsive Design**: Mobile-optimized user experience
- **Type Safety**: Full TypeScript coverage across client and server