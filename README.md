# Proof Response Funding Intelligence Engine

A clean, minimal, and scalable Next.js application that will power the Proof Response Funding Intelligence Engine. It ships with MongoDB (via Mongoose), basic authentication, and a protected dashboard, ready to extend with future automation.

## Project Structure

```
proof-response/
├── pages/              # Next.js pages and API routes
│   ├── api/           # Backend API endpoints
│   │   ├── auth/      # Authentication routes (login, signup, logout, me)
│   │   ├── users/     # User CRUD routes
│   │   ├── test.js    # Example API endpoint
│   │   └── test-db.js # MongoDB connection test endpoint
│   ├── index.js       # Main homepage
│   ├── login.js       # Login page
│   ├── signup.js      # Signup page
│   └── dashboard.js   # Protected dashboard
│   └── _app.js        # Next.js app wrapper
├── components/         # Reusable React components
│   ├── Header.js      # Site header component
│   ├── Footer.js      # Site footer component
│   └── Layout.js      # Main layout wrapper
├── lib/                # Utility functions and helpers
│   ├── db.js          # Mongoose connection helper
│   └── auth.js        # JWT helpers and cookie utilities
├── models/             # Mongoose models
│   └── User.js        # User schema and model
├── styles/             # Global styles
│   └── globals.css    # Global CSS styles
├── scripts/            # Automation scripts (placeholder)
├── .env                # Environment variables (MongoDB URI, JWT secret)
├── .env.example        # Example environment variables
├── next.config.js      # Next.js configuration
└── package.json        # Project dependencies
```

## Folder Purposes

### `/pages`
Contains all Next.js pages and API routes. The `/pages/api` subdirectory houses all backend API endpoints that handle server-side logic and database operations.

### `/components`
Reusable React components that can be used across different pages. Currently includes Header, Footer, and Layout components.

### `/lib`
Utility functions and helpers. The `db.js` file provides a Mongoose connection helper that manages MongoDB connections with caching to prevent multiple connections during development hot reloads.

### `/styles`
Global CSS styles and theme variables. The `globals.css` file is imported in `_app.js` and applies site-wide styling.

### `/scripts`
Placeholder directory for future automation scripts, build tools, or deployment scripts.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB instance (local or cloud)

### Installation (Local)

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env` (or `.env.local`)
   - Update values as needed:
     ```env
     MONGODB_URI=mongodb://127.0.0.1:27017/proofresponse
     JWT_SECRET=change_me_to_a_long_random_string
     NEXT_PUBLIC_BASE_URL=http://localhost:3000
     ```
   - For production, set `MONGODB_URI` to your managed MongoDB URI and use a strong `JWT_SECRET`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Windows: Fixing SWC Binary Warning/Errors

If you see:

```
⚠ Attempted to load @next/swc-win32-x64-msvc, but an error occurred:
⨯ Failed to load SWC binary for win32/x64
```

Follow these steps:

1) Verify 64‑bit Node.js
```powershell
node -p "process.platform + ' ' + process.arch + ' ' + process.versions.node"
```
Expected: `win32 x64 <node-version>`. If you see `ia32`, uninstall Node and install the 64‑bit LTS (Node 20+ recommended).

2) Install Microsoft Visual C++ Redistributable (x64)
Install the latest supported x64 redistributable for Visual Studio 2015–2022, then restart the terminal:
`https://aka.ms/vs/17/release/vc_redist.x64.exe`

3) Clean install
```powershell
rd /s /q node_modules
rd /s /q .next
del /f /q package-lock.json
npm cache clean --force
npm install
```

4) Start dev server
```powershell
npm run dev
```

5) Optional fallback (only if the error persists)
- Disable SWC minify in `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // fallback to Terser
}
module.exports = nextConfig
```
- Or use Babel by adding a `.babelrc`:
```json
{
  "presets": ["next/babel"]
}
```
Then re-run the clean install steps above.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## API Endpoints

### Example Endpoints

- **GET** `/api/test` - Returns a simple JSON response to verify API is working
- **GET** `/api/test-db` - Tests MongoDB connection using Mongoose, creates and saves a test document
- **POST** `/api/auth/signup` - Create a new user and set auth cookie
- **POST** `/api/auth/login` - Authenticate user and set auth cookie
- **POST** `/api/auth/logout` - Clear auth cookie
- **GET** `/api/auth/me` - Get current authenticated user
- **GET** `/api/users` - List users (no passwords)
- **POST** `/api/users` - Create user (admin only)
- **GET/PUT/DELETE** `/api/users/:id` - Read/update/delete a user (role protected)

You can extend this by adding more endpoints in `/pages/api/` following the same pattern.

## MongoDB Setup with Mongoose

This project uses **Mongoose** for MongoDB schema management and database connections. The connection helper in `/lib/db.js` uses a cached connection pattern to prevent multiple connections during Next.js hot reloads in development.

### Environment Variables

Next.js loads `.env.local` and `.env` automatically for server code and API routes.

Recommended local setup:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/proofresponse
JWT_SECRET=change_me_to_a_long_random_string
```

In development, if `MONGODB_URI` is not set, the app will fallback to `mongodb://127.0.0.1:27017/proofresponse`. In production, the variable is required.

### Using Mongoose in API Routes

Import the connection helper and use Mongoose models in your API routes:

```javascript
import connectDB from '../../lib/db';
import mongoose from 'mongoose';

// Define your schema
const MySchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});

// Create model (prevents overwrite errors during hot reloads)
const MyModel = mongoose.models.MyModel || mongoose.model('MyModel', MySchema);

export default async function handler(req, res) {
  // Connect to MongoDB
  await connectDB();
  
  // Use your model
  const doc = new MyModel({ name: 'Example' });
  await doc.save();
  
  res.status(200).json({ success: true, data: doc });
}
```

### Testing the Connection

1. Make sure MongoDB is running locally (or your MongoDB instance is accessible)
2. Start the development server: `npm run dev`
3. Visit `http://localhost:3000/api/test-db` in your browser
4. You should see a JSON response with the created test document

If you see an error, check:
- MongoDB is running and accessible
- The `MONGODB_URI` in `.env` is correct
- The database name in the URI matches your MongoDB database

## Development Notes

- This project uses the **Pages Router** (not App Router)
- **No TypeScript** - all files use JavaScript
- **No ESLint** - minimal linting setup
- Components use **styled-jsx** for scoped styling
- Mongoose connection is optimized for both development and production with connection caching
- Authentication uses HTTP-only cookies with JWT. Update `JWT_SECRET` in `.env`.

## Next Steps

1. Add more API endpoints in `/pages/api/`
2. Create additional pages in `/pages/`
3. Build out reusable components in `/components/`
4. Extend the MongoDB connection with specific database operations
5. Add authentication if needed
6. Implement CRUD operations for your data models

## License

Private project - All rights reserved

