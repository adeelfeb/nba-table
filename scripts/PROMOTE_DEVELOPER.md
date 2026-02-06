# Promote User to Developer Role

Promotes an existing user (by email) to the **developer** role. Useful after deployment or when onboarding a new developer.

## Requirements

- Node.js installed
- `MONGODB_URI` in `.env` or `.env.local`
- User must already exist (signed up) with the given email

## Usage

Run the script (it will prompt for the email):

```bash
./scripts/promote-to-developer.sh
```

Example:

```
Enter the email of the user to promote to developer:
developer@yourcompany.com
```

## Deployment / SSH

When you SSH into the server after deployment:

```bash
cd /path/to/portfolio
./scripts/promote-to-developer.sh
```

The script runs **standalone**—it does **not** require the Next.js server to be running. It connects directly to MongoDB using `MONGODB_URI`.

## Behavior

- Validates email format
- Ensures the `developer` role exists (creates it if needed)
- Finds user by email (case-insensitive)
- Updates the user's role to `developer` and marks their email as verified
- Exits with code 0 on success, 1 on error
