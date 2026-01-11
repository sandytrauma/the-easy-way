Tech Stack
Framework: Next.js 15 (App Router)

Styling: Tailwind CSS + Shadcn UI

Database: Neon (Serverless PostgreSQL)

ORM: Drizzle ORM

Auth: Auth.js (NextAuth v5)

Language: TypeScript


Prerequisites
Before you begin, ensure you have the following accounts:

GitHub account.

Neon Console account (for the database).

Node.js (v18.17 or later) installed.

Installation & Setup
1. Clone the Repository
git clone https://github.com/sandytrauma/the-easy-way.git

2. Install Dependencies
npm install

3. Configure Environment Variables
# Neon Database Connection String
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"

# Auth.js Secret (Generate one using 'openssl rand -base64 32')
AUTH_SECRET="your-32-character-secret-key"

# Base URL (Optional for local dev)
NEXTAUTH_URL="http://localhost:3000"

4. Database Initialization
# Push the schema to Neon
npx drizzle-kit push

# Seed the database with initial users and components
npm run db:seed

Project Architecture
Understanding the folder structure is key to adding your own AI components:

src/app/(auth): Contains login and registration logic.

src/app/dashboard: The core "private window" for users.

src/components/ui: Shared Shadcn components (Buttons, Inputs, etc.).

src/db/schema.ts: Define your database tables (Users, Subscriptions, Apps).

src/lib/actions: Server Actions for database mutations (Registration, Upgrading).

Developing Your AI Apps
To add a new AI component (e.g., a "Code Generator"):

Define the App: Add a new card in src/app/dashboard/page.tsx.

Gate the Access: Set the requiredPlan to "free" or "pro" in the component props.

Create the API: Build a route in src/app/api/ai/ to handle the AI logic, ensuring it checks session.user.plan.

Security & Best Practices
Password Hashing: The template uses bcryptjs for all registrations. Never store plain text passwords.

Data Isolation: Every dashboard fetch is keyed by the user's unique id stored in the JWT session.

Middleware: Routes are protected by src/middleware.ts. Unauthorized users are automatically redirected to /login.


Deployment
To deploy this to Vercel:

Push your code to GitHub.

Import the project into Vercel.

Add your .env.local variables to the Vercel Project Settings.

The npx drizzle-kit push command should be part of your build pipeline or run manually once the DB is connected.

📞 Support
For custom component development or integration assistance, please refer to the internal documentation or contact the platform administrator.

