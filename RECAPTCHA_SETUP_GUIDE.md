# Google reCAPTCHA v2 Invisible Setup Guide

This guide explains how to set up Google reCAPTCHA v2 Invisible for **designndev.com** to protect your login, signup, Valentine contest, and dashboard forms from spam, bots, and phishing.

---

## Step 1: Get Your reCAPTCHA Keys

You already have a reCAPTCHA site. If you need to create a new one or add domains:

1. **Go to reCAPTCHA Admin Console**
   - Visit: [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
   - Sign in with your Google account (e.g. at4563323@gmail.com)

2. **Register a new site (or edit existing)**
   - Click **Create** or edit your existing **designndev.com** site
   - **Label**: `designndev.com` (or any friendly name)
   - **reCAPTCHA type**: Select **reCAPTCHA v2** → **Invisible reCAPTCHA badge**

3. **Add Domains**
   Add **both** domains so reCAPTCHA works locally and in production:
   - `designndev.com` — for production
   - `localhost` — for local testing (include the port if needed: `127.0.0.1` also works)

   You can use a single key pair for both; Google allows multiple domains per site.

4. **Accept Terms & Submit**
   - Check the reCAPTCHA Terms of Service
   - Click **Submit**

5. **Copy Your Keys**
   - **Site Key** (public) — used in the frontend; safe to expose
   - **Secret Key** (private) — used only on the server; never expose

---

## Step 2: Add Environment Variables

Add these to your `.env` (or `.env.local`):

```env
# Google reCAPTCHA v2 Invisible
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` — available to the browser (Next.js makes `NEXT_PUBLIC_*` vars public)
- `RECAPTCHA_SECRET_KEY` — server-only; never sent to the client

For **Vercel** or other hosting:
- Add the same variables in your project’s environment settings
- Redeploy after adding them

---

## Step 3: Domains in reCAPTCHA Admin

In [reCAPTCHA Admin](https://www.google.com/recaptcha/admin):

- **Production**: `designndev.com` (and `www.designndev.com` if you use it)
- **Local**: `localhost` and optionally `127.0.0.1`

If you use a staging domain (e.g. `staging.designndev.com`), add it as well.

---

## Step 4: Security Preferences (Optional)

In your site settings:

- **Verify the origin of reCAPTCHA solutions**: Recommended to keep **enabled** so Google checks the hostname when verifying.
- **Send alerts to owners**: Enable to receive emails if Google detects issues (e.g. misconfiguration or suspicious traffic).

---

## Where reCAPTCHA Is Used

| Page/Component | Route | Purpose |
|----------------|-------|---------|
| Login | `/login` | Prevent brute force and bot login attempts |
| Signup | `/signup` | Prevent fake account creation and spam |
| Valentine Contest | `/valentine` | Protect contest form from bots |
| Dashboard Help | `/dashboard#help` | Protect help request form |
| Dashboard Resolutions | `/dashboard#resolutions` | Protect resolution creation |
| Dashboard Blogs | `/dashboard#blogs` | Protect blog creation |

---

## Troubleshooting

### "Invalid site key" or badge not showing
- Confirm `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set and correct
- Ensure the domain (e.g. `localhost` or `designndev.com`) is added in reCAPTCHA admin

### "Invalid reCAPTCHA" or verification fails on submit
- Confirm `RECAPTCHA_SECRET_KEY` is set correctly on the server
- Check that the domain in reCAPTCHA admin matches the domain used in the request

### Works locally but not on designndev.com
- Add `designndev.com` (and `www.designndev.com` if needed) to reCAPTCHA domains
- Ensure the env vars are set in your production environment and redeploy

---

## References

- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA v2 Invisible Documentation](https://developers.google.com/recaptcha/docs/invisible)
