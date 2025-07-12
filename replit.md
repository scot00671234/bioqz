# bioqz - Personal Bio Page SaaS

## Overview

bioqz is a micro-SaaS application that allows users to create personalized bio pages with custom usernames (e.g., bioqz.com/username). The application features user authentication, Stripe payment integration for premium features, and a modern responsive design built with React and Express. The app has a warm, inviting UI with smooth animations and limits free users to 1 link while offering profile picture uploads.

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
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, STRIPE_SECRET_KEY
- **Database Migrations**: Automatic schema updates via Drizzle
- **Static Assets**: Served from dist/public directory
- **API Routes**: Prefixed with /api for clear separation

### Key Features
- **Public Bio Pages**: Accessible via /{username} routes
- **Protected Dashboard**: Authenticated user management interface
- **Payment Integration**: Stripe-powered subscription system
- **Responsive Design**: Mobile-optimized user experience
- **Type Safety**: Full TypeScript coverage across client and server