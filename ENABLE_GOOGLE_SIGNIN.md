# Enable Google Sign-In for Bridge

## Quick Setup Guide

### 1. Open Firebase Console
Go to: https://console.firebase.google.com/project/ask-gene-61b15/authentication/providers

### 2. Enable Authentication Providers

#### Enable Email/Password:
1. Click on **"Email/Password"**
2. Toggle **Enable** (first switch)
3. Click **Save**

#### Enable Google:
1. Click on **"Google"**
2. Toggle **Enable**
3. Set **Project support email**: `yichencai2022@gmail.com`
4. Click **Save**

### 3. Verify Authorized Domains

In the Firebase Console Authentication page:
1. Go to **Settings** tab
2. Scroll to **Authorized domains**
3. Make sure these domains are listed:
   - `localhost` (for local development)
   - Your production domain (when deploying)

### 4. Test Google Sign-In

1. Go to http://localhost:3000/login
2. Click **"Sign in with Google"**
3. You should see Google's sign-in popup

## Common Issues & Solutions

### Issue 1: "Firebase: Error (auth/configuration-not-found)"
**Solution:** Firebase Authentication is not enabled
- Go to Firebase Console → Authentication
- Click "Get started"
- Enable Email/Password and Google providers

### Issue 2: "Firebase: Error (auth/unauthorized-domain)"
**Solution:** localhost is not authorized
- Go to Firebase Console → Authentication → Settings
- Scroll to "Authorized domains"
- Add `localhost`

### Issue 3: "Firebase: Error (auth/popup-blocked)"
**Solution:** Browser is blocking the popup
- Allow popups for localhost in your browser settings
- Try using a different browser

### Issue 4: "Firebase: Error (auth/invalid-api-key)"
**Solution:** Firebase configuration is incorrect
- Check `.env.local` has correct values
- Verify `NEXT_PUBLIC_FIREBASE_API_KEY` matches Firebase Console
- Restart dev server: Stop and run `npm run dev` again

### Issue 5: Google sign-in popup opens but shows error
**Solution:** Project support email not set
- Go to Firebase Console → Authentication → Sign-in method
- Click on Google provider
- Add your email as "Project support email"
- Save

## Verify Your Setup

### Check Firebase Configuration
Run this command to verify your .env.local:
```bash
npm run verify
```

Should show:
- ✓ Firebase Client Config
- ✓ Firebase Admin SDK
- ✓ Elasticsearch

### Test in Browser Console
1. Open http://localhost:3000/login
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Click "Sign in with Google"
5. Watch for errors in the console

## After Enabling Google Sign-In

### What Happens:
1. User clicks "Sign in with Google"
2. Google sign-in popup appears
3. User selects Google account
4. User is redirected to `/dashboard`
5. User profile is created in Firestore

### First Time Users:
- When someone signs in with Google for the first time
- Their profile is automatically created in Firestore
- Default role is set to "seeker"
- They can update their profile in the signup flow

## Need More Help?

If Google sign-in still doesn't work:
1. Check browser console for errors (F12 → Console)
2. Check terminal for server errors
3. Make sure you completed all Firebase setup steps
4. See `SETUP_CHECKLIST.md` for complete setup guide

## Security Note

⚠️ **Important for Production:**
- Add your production domain to Authorized domains before deploying
- Never commit `.env.local` to git
- Use environment variables in production hosting
