# Get Firebase Admin SDK Credentials

Follow these simple steps to get your Admin SDK credentials:

## Method 1: Using Firebase Console (Recommended)

1. **Click this link to go directly to your service accounts page:**

   👉 https://console.firebase.google.com/project/ask-gene-61b15/settings/serviceaccounts/adminsdk

2. **Click the "Generate new private key" button**

3. **Click "Generate key" in the popup**
   - A JSON file will download automatically

4. **Open the downloaded JSON file** and you'll see something like this:

```json
{
  "type": "service_account",
  "project_id": "ask-gene-61b15",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nABC123...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@ask-gene-61b15.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

5. **Copy these two values to your `.env.local` file:**

   - Find the `"client_email"` value
   - Find the `"private_key"` value (it starts with `-----BEGIN PRIVATE KEY-----`)

6. **Update your `.env.local` file:**

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ask-gene-61b15.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"
```

⚠️ **IMPORTANT:**
- Keep the double quotes around the FIREBASE_PRIVATE_KEY
- Keep the `\n` characters in the key (don't replace them with actual line breaks)
- Don't commit this file to git (it's already in .gitignore)

## Done!

Once you've added these two lines to `.env.local`, run:

```bash
npm run verify
```

This will check if everything is configured correctly!
