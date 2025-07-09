# Baby Wellness Tracker

## Overview

This is a full-stack baby wellness tracking application designed to help parents monitor their baby's daily activities including feeding, diaper changes, sleep patterns, health records, and growth milestones. The application provides a mobile-first experience with a clean, intuitive interface optimized for quick data entry during busy parenting moments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library (New York variant)
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Built-in session handling with connect-pg-simple

### Mobile-First Design
- Responsive design optimized for mobile devices
- Bottom navigation for easy thumb navigation
- Touch-friendly interface elements
- PWA-ready structure for native app-like experience

## Key Components

### Data Models
- **Babies**: Core entity with name, birth date, and gender
- **Feeds**: Bottle/breastfeeding tracking with amounts, duration, and timestamps
- **Nappies**: Diaper change logging (wet/soiled/both)
- **Sleep Sessions**: Sleep tracking with start/end times and sleep type
- **Health Records**: Temperature, mood, symptoms, and medication tracking
- **Growth Records**: Weight, height, and head circumference measurements
- **Vaccinations**: Immunization tracking with dates and types

### User Interface Components
- **Quick Entry Modal**: Fast data input for common activities
- **Activity Feed**: Chronological view of recent baby activities
- **Stats Overview**: Daily summary cards with key metrics
- **Chart Preview**: Visual patterns and trends over time
- **Bottom Navigation**: Mobile-optimized navigation between sections

### API Structure
RESTful API endpoints organized by resource:
- `/api/babies` - Baby management
- `/api/babies/:id/feeds` - Feeding records
- `/api/babies/:id/nappies` - Diaper tracking
- `/api/babies/:id/sleep` - Sleep session management
- `/api/babies/:id/health` - Health record tracking
- `/api/babies/:id/growth` - Growth measurement tracking

## Data Flow

1. **User Input**: Parents enter data through the quick entry modal or dedicated forms
2. **Client Validation**: Zod schemas validate data on the client side
3. **API Request**: TanStack Query manages API calls with optimistic updates
4. **Server Processing**: Express routes validate and process requests
5. **Database Storage**: Drizzle ORM handles type-safe database operations
6. **Cache Invalidation**: Query client automatically updates UI with fresh data
7. **Real-time Updates**: Activity feeds and stats update immediately

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **date-fns**: Date manipulation and formatting
- **react-hook-form**: Form state management
- **zod**: Schema validation

### UI Dependencies
- **@radix-ui**: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Variant-based styling
- **lucide-react**: Modern icon library

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration toolkit

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend development
- Express server with TypeScript compilation via tsx
- Automatic database schema synchronization

### Production Build
1. Frontend build via Vite (outputs to `dist/public`)
2. Backend compilation via esbuild (outputs to `dist/index.js`)
3. Database migrations via Drizzle Kit
4. Static file serving through Express

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (Neon Database)
- Node.js 18+ for ES modules support
- PostgreSQL database with proper schema

### Scalability Considerations
- Stateless server design for horizontal scaling
- Database connection pooling via Neon
- Optimistic updates reduce server load
- Efficient query patterns with proper indexing

## Changelog

```
Changelog:
- July 08, 2025. Initial setup
- July 09, 2025. Successfully deployed MVP with core features
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```