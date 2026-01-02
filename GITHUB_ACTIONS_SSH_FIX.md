# GitHub Actions SSH Key Fix

## Issue Identified

The GitHub Actions workflow was failing with the error:
```
Error loading key "(stdin)": error in libcrypto
```

## Root Causes

This error typically occurs due to one or more of the following issues with the SSH private key:

1. **Missing Newline at End**: The private key must end with a newline character after `-----END OPENSSH PRIVATE KEY-----`
2. **Carriage Return Characters**: Windows-style line endings (`\r\n`) can cause issues
3. **Improper Formatting**: Extra spaces, missing headers/footers, or corrupted key data
4. **Wrong Key Type**: Using public key instead of private key (though this is less likely)

## Solution Applied

The workflow has been updated to:

1. **Manually handle SSH key setup** instead of relying solely on `webfactory/ssh-agent` action
2. **Clean the key** by removing carriage return characters (`\r`)
3. **Ensure proper formatting** by adding a trailing newline
4. **Set correct permissions** (600 for private key, 700 for .ssh directory)
5. **Add connection testing** before deployment
6. **Clean up the key** after deployment for security

## How to Fix Your GitHub Secret

If the issue persists, verify your `DROPLET_SSH_KEY` secret in GitHub:

### Steps to Fix:

1. **Get your private key** from your local machine:
   ```bash
   cat ~/.ssh/id_rsa
   # or
   cat ~/.ssh/id_ed25519
   ```

2. **Verify the key format**:
   - Should start with: `-----BEGIN OPENSSH PRIVATE KEY-----` or `-----BEGIN RSA PRIVATE KEY-----`
   - Should end with: `-----END OPENSSH PRIVATE KEY-----` or `-----END RSA PRIVATE KEY-----`
   - Should have a newline after the ending line

3. **Copy the entire key** including:
   - The BEGIN line
   - All key data lines
   - The END line
   - **Press Enter after the END line** to add a trailing newline

4. **Update the secret in GitHub**:
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Edit `DROPLET_SSH_KEY`
   - Paste the key exactly as copied
   - Make sure there's a newline at the end
   - Save

### Alternative: Convert Key to PEM Format

If you're using OpenSSH format and having issues, you can convert to PEM:

```bash
# Convert OpenSSH key to PEM format
ssh-keygen -p -f ~/.ssh/id_rsa -m pem

# Then copy the converted key to GitHub secrets
cat ~/.ssh/id_rsa
```

## Workflow Changes

### Before:
- Used `webfactory/ssh-agent@v0.9.0` directly with secret
- No key validation or cleaning
- No connection testing

### After:
- Manual SSH key setup with cleaning
- Key format validation
- Connection testing before deployment
- Proper cleanup after deployment

## Testing

After updating the secret and workflow:

1. Push to the `main` branch or manually trigger the workflow
2. Check the workflow logs for:
   - ✅ "SSH key format verification" (if successful)
   - ✅ "SSH connection successful"
   - ✅ "Deployment completed successfully!"

## Additional Notes

- The workflow now uses `StrictHostKeyChecking=no` to avoid host key verification issues
- SSH keys are cleaned up after deployment for security
- If you prefer to use the `ssh-agent` action, ensure your key is properly formatted in the secret first

