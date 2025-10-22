# TinyTracks - Local Development Setup Guide

Welcome to TinyTracks! This guide will help you get the application running on your local machine for development and testing.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL Database** - We recommend [Neon](https://neon.tech) (free serverless PostgreSQL)

---

## 🚀 Quick Start (5-10 minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/tinytracks.git
cd tinytracks
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React, TypeScript, and Vite for the frontend
- Express and Drizzle ORM for the backend
- All UI components and utilities

### Step 3: Set Up Database

#### Option A: Using Neon (Recommended - Free)

1. Go to [neon.tech](https://neon.tech) and sign up for a free account
2. Create a new project
3. Copy your connection string (it looks like this):
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database:
   ```bash
   createdb tinytracks
   ```
3. Your connection string will be:
   ```
   postgresql://localhost:5432/tinytracks
   ```

### Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Open `.env` and update the following values:

   ```bash
   # Your database connection string from Step 3
   DATABASE_URL=postgresql://your-connection-string-here

   # Generate a secure session secret (run this command):
   # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   SESSION_SECRET=your-generated-secure-random-string-here

   # Leave as development for local testing
   NODE_ENV=development
   ```

### Step 5: Initialize the Database

Run database migrations to create all necessary tables:

```bash
npm run db:push
```

You should see output confirming tables were created successfully.

### Step 6: Seed the Database (Optional but Recommended)

To populate your database with sample data for testing:

```bash
npm run db:seed
```

This creates:
- A test user account (email: `demo@tinytracks.app`, password: `password123`)
- A baby profile named "Emma"
- Sample feeding, sleep, and health records
- Sample pregnancy data
- And more!

### Step 7: Start the Development Server

```bash
npm run dev
```

The application will start at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 8: Test the Application

1. Open http://localhost:5173 in your browser
2. If you seeded the database:
   - Login with `demo@tinytracks.app` / `password123`
3. If you didn't seed:
   - Register a new account
   - Create a baby profile
   - Start logging activities!

---

## 🛠️ Common Issues & Solutions

### Issue: "DATABASE_URL must be set" Error

**Solution:** Make sure your `.env` file exists and has a valid `DATABASE_URL`. Check that you copied `env.example` to `.env`.

```bash
# Verify your .env file exists
ls -la .env

# If not, create it
cp env.example .env
```

### Issue: Database Connection Fails

**Solution:** 
1. Verify your connection string is correct
2. Check that your database is running (for local PostgreSQL)
3. For Neon, ensure you copied the full connection string including `?sslmode=require`

### Issue: "Jest not found" or Test Errors

**Solution:** We've fixed the Windows compatibility. Run:
```bash
npm test
```

If you still see issues, try:
```bash
npx jest
```

### Issue: Port 5173 Already in Use

**Solution:** Another Vite app is running. Either:
1. Stop the other application
2. Or change the port in `vite.config.ts`:
   ```typescript
   server: {
     port: 5174, // Use a different port
   }
   ```

### Issue: "Cannot find module 'bcrypt'"

**Solution:** Reinstall bcrypt:
```bash
npm uninstall bcrypt
npm install bcrypt
```

On Windows, you may need Visual Studio Build Tools. Install from [here](https://visualstudio.microsoft.com/downloads/).

---

## 📁 Project Structure

```
TinyTracks/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and helpers
│   │   └── types/       # TypeScript type definitions
│   └── public/          # Static assets
├── server/              # Backend Express application
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database operations
│   └── db.ts            # Database connection
├── shared/              # Code shared between client/server
│   └── schema.ts        # Database schema & types
├── scripts/             # Utility scripts
│   └── seed-database.ts # Sample data generator
└── api/                 # Vercel serverless function entry
```

---

## 🧪 Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in watch mode (auto-rerun on changes):
```bash
npm run test:watch
```

### Generate coverage report:
```bash
npm run test:coverage
```

Coverage reports will be in the `coverage/` directory.

---

## 🔍 Database Management

### View Current Schema
```bash
npx drizzle-kit studio
```
This opens a web interface to browse your database at http://localhost:4983

### Create New Migration
After modifying `shared/schema.ts`:
```bash
npm run db:push
```

### Reset Database (⚠️ Destroys all data)
```bash
# Drop all tables and recreate
npm run db:push -- --force
npm run db:seed
```

---

## 📊 Development Tools

### Check TypeScript Types
```bash
npm run check
```

### Lint Code
```bash
npm run lint
```

### Auto-fix Linting Issues
```bash
npm run lint:fix
```

### Analyze Bundle Size
```bash
npm run analyze
```
Opens a visualization of your bundle size.

### Performance Audit
```bash
npm run audit:lighthouse
```
Runs Lighthouse performance audit.

---

## 🐛 Debugging

### Backend API Debugging

1. Check server logs in the terminal where you ran `npm run dev`
2. API endpoints are at `http://localhost:3000/api/*`
3. Test endpoints with curl or Postman:
   ```bash
   # Test API health
   curl http://localhost:3000/api/babies
   ```

### Frontend Debugging

1. Open browser DevTools (F12)
2. Check Console for errors
3. Network tab to see API requests
4. React DevTools extension for component inspection

### Database Debugging

1. Use Drizzle Studio:
   ```bash
   npx drizzle-kit studio
   ```
2. Or connect with any PostgreSQL client using your `DATABASE_URL`

---

## 🚢 Building for Production

### Build the application:
```bash
npm run build
```

This creates optimized production bundles in the `dist/` directory.

### Test production build locally:
```bash
npm run start
```

---

## 🔐 Security Notes for Development

- **Never commit your `.env` file** - It's in `.gitignore` by default
- The included `env.example` is safe to commit (no real credentials)
- Default credentials for seeded database:
  - Email: `demo@tinytracks.app`
  - Password: `password123`
- These are for **local development only** - use real credentials in production

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `SESSION_SECRET`

### Environment Variables for Production

Make sure to set these in your hosting platform:
```bash
DATABASE_URL=your-production-database-url
SESSION_SECRET=your-production-secret-min-32-chars
NODE_ENV=production
```

---

## 📞 Getting Help

If you encounter issues not covered in this guide:

1. Check the [Architecture Documentation](docs/ARCHITECTURE.md)
2. Review the [API Documentation](docs/API.md)
3. Search existing [GitHub Issues](https://github.com/yourusername/tinytracks/issues)
4. Create a new issue with:
   - Your operating system
   - Node.js version (`node --version`)
   - Error messages (full stack trace)
   - Steps to reproduce

---

## 🎯 Next Steps

Once you have the app running:

1. **Explore the UI** - Try adding feeds, nappies, and sleep sessions
2. **Check the API** - Review `server/routes.ts` to see all available endpoints
3. **Customize** - Modify components in `client/src/components/`
4. **Add Features** - Follow the patterns in existing code
5. **Write Tests** - Add tests alongside your new features

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Express.js Guide](https://expressjs.com)
- [Vite Documentation](https://vitejs.dev)

---

## 🎉 You're Ready!

Congratulations! You should now have TinyTracks running locally. Happy coding! 🚀

If you found this guide helpful, please star the repository on GitHub ⭐

---

**Last Updated:** October 22, 2025
**TinyTracks Version:** 1.1.0

