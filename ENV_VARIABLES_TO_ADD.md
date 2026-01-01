# Environment Variables to Add for Email Verification

## Problem
Your server is showing that SMTP variables are "NOT SET" even though they exist in your `.env` file. This is because the variables need to be in `.env.local` (which takes precedence).

## Solution: Add these variables to `.env.local`

Create or update your `.env.local` file with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/proofresponse
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters_long

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email Configuration - SMTP Protocol (REQUIRED for email verification)
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=25
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@yourdomain.com

# Node Environment
NODE_ENV=development

# CORS
CORS_DEFAULT_ORIGINS=http://localhost:3000

# Superadmin Setup
SUPERADMIN_SETUP_TOKEN=your_setup_token_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Recaptcha
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Loxo API (if using)
LOXO_API_KEY=your_loxo_api_key
LOXO_SLUG=your_loxo_slug
```

## What to Do

1. **Copy the above content** and paste it into your `.env.local` file
2. **Save the file**
3. **Restart your server**:
   ```bash
   npm run dev
   ```

## Why .env.local?

- `.env.local` takes precedence over `.env`
- It's in `.gitignore` (safe for secrets)
- Variables in `.env.local` override those in `.env`

## After Adding Variables

Once you restart the server, you should see in the logs:
- `[Config] SMTP_USERNAME: Set`
- `[Config] SMTP_PASSWORD: Set`
- `[Config] SMTP_FROM: Set`

And email verification should work for signup!

## For Production (Ubuntu)

The same SMTP variables will work on your Ubuntu production server. Just make sure to set these environment variables in your hosting platform or `.env.local` file on production.






