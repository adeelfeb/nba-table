# SMTP2GO API Key Environment Variables

## Required Environment Variables for SMTP2GO API

Add these variables to your `.env` or `.env.local` file to use SMTP2GO's REST API for sending emails:

```env
# SMTP2GO API Configuration (Required for email sending)
SMTP2GO_API_KEY=your_smtp2go_api_key_here
SMTP2GO_FROM_EMAIL=noreply@designndev.com
SMTP2GO_FROM_NAME=Design n Dev
```

## How to Get Your SMTP2GO API Key

1. **Log in to SMTP2Go Dashboard**
   - Go to [https://app.smtp2go.com/](https://app.smtp2go.com/)
   - Sign in to your account

2. **Navigate to API Keys**
   - Go to **Settings** → **API Keys** (or **SMTP Users** → **API Keys**)
   - If you don't have an API key, click **Create API Key** or **Add API Key**
   - Copy the API key (it will look like: `api-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

3. **Verify Your Sender Email**
   - Go to **Sending** → **Verified Senders** in the SMTP2Go dashboard
   - Make sure the email address you want to use (e.g., `noreply@designndev.com`) is verified
   - If not verified, add it and click the verification link sent to that email

## Environment Variables Explained

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SMTP2GO_API_KEY` | ✅ **Yes** | Your SMTP2Go API key from the dashboard | `api-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `SMTP2GO_FROM_EMAIL` | ✅ **Yes** | The verified sender email address | `noreply@designndev.com` |
| `SMTP2GO_FROM_NAME` | ❌ No | Display name for the sender (optional) | `Design n Dev` |

## Fallback Behavior

- If `SMTP2GO_FROM_EMAIL` is not set, the system will try to use `SMTP_FROM` as a fallback
- However, it's recommended to set `SMTP2GO_FROM_EMAIL` explicitly

## Complete .env Example

```env
# Database
MONGODB_URI=mongodb://127.0.0.1:27017/proofresponse

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NODE_ENV=development

# SMTP2GO API Configuration (for email verification)
SMTP2GO_API_KEY=api-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP2GO_FROM_EMAIL=noreply@designndev.com
SMTP2GO_FROM_NAME=Design n Dev

# Optional: SMTP Protocol (fallback - not needed if using API key)
# SMTP_HOST=mail.smtp2go.com
# SMTP_PORT=25
# SMTP_USERNAME=noreply@designndev.com
# SMTP_PASSWORD=your_password_here
# SMTP_FROM=noreply@designndev.com
# SMTP_SECURE=false
```

## After Adding Variables

1. **Save your `.env` or `.env.local` file**
2. **Restart your development server** (if running)
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```
3. **Test the email functionality**
   - Try signing up a new user
   - Check the email inbox for the verification code

## Troubleshooting

### Error: "SMTP2GO_API_KEY is not configured"
- Make sure you've added `SMTP2GO_API_KEY` to your `.env.local` file
- Restart your server after adding the variable
- Check for typos in the variable name

### Error: "SMTP2Go API error: 401" or "Invalid API key"
- Verify your API key is correct (no extra spaces or quotes)
- Make sure the API key hasn't been revoked in the SMTP2Go dashboard
- Check that you copied the entire API key

### Error: "SMTP2Go API error: 400" or "Sender not verified"
- Ensure the email in `SMTP2GO_FROM_EMAIL` is verified in your SMTP2Go account
- Go to **Sending** → **Verified Senders** in SMTP2Go dashboard
- Verify the sender email address if it's not already verified

### Emails Not Being Received
- Check spam/junk folder
- Verify the recipient email address is correct
- Check SMTP2Go dashboard for delivery status
- Review server logs for any error messages

## Notes

- The API key method is **preferred** over SMTP username/password
- The code will automatically use the API key if available, and fall back to SMTP protocol only if the API key is not set
- Once you set `SMTP2GO_API_KEY`, the system will use the REST API instead of SMTP protocol

