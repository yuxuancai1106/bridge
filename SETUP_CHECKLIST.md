# Firebase Setup Checklist

Use this checklist to track your Firebase setup progress.

## ✅ Completed

- [x] Firebase project created (ask-gene-61b15)
- [x] Firebase CLI installed and logged in
- [x] Firebase initialized in project
- [x] Firestore security rules deployed
- [x] Backend code implemented
- [x] Dependencies installed

## 📝 To Do (Follow in order)

### 1. Download Service Account Key

Browser tab opened at:
https://console.firebase.google.com/project/ask-gene-61b15/settings/serviceaccounts/adminsdk

- [ ] Click "Generate new private key"
- [ ] Download the JSON file
- [ ] Note the file location

### 2. Add Credentials to .env.local

**Option A: Automatic (Recommended)**
```bash
npm run setup:credentials
```
- [ ] Run the command above
- [ ] Paste the path to the downloaded JSON file
- [ ] Let the script add credentials automatically

**Option B: Manual**
- [ ] Open the downloaded JSON file
- [ ] Copy `client_email` to `.env.local`
- [ ] Copy `private_key` to `.env.local`
- [ ] See `GET_ADMIN_CREDENTIALS.md` for detailed instructions

### 3. Enable Firebase Authentication

Browser tab opened at:
https://console.firebase.google.com/project/ask-gene-61b15/authentication/providers

- [ ] Click "Get started" (if needed)
- [ ] Enable "Email/Password" provider
- [ ] (Optional) Enable "Google" provider

### 4. Create Firestore Database

Browser tab opened at:
https://console.firebase.google.com/project/ask-gene-61b15/firestore

- [ ] Click "Create database" (if needed)
- [ ] Select "Production mode"
- [ ] Choose location: nam5 (us-central)
- [ ] Click "Enable"
- [ ] Wait for database to be created

### 5. Get Fetch.ai API Key (For AI Features)

- [ ] Go to https://fetch.ai/platform or https://agentverse.ai/
- [ ] Sign up or log in
- [ ] Create a new API key
- [ ] Add to `.env.local`: `NEXT_PUBLIC_FETCH_AI_API_KEY=your_key`

### 6. Set up Elasticsearch (Optional but recommended)

**Option A: Docker (Quick)**
```bash
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.11.0
npm run setup:elastic
```

**Option B: Elastic Cloud**
- [ ] Sign up at https://cloud.elastic.co/
- [ ] Create deployment
- [ ] Update `.env.local` with cloud credentials

### 7. Verify Setup

```bash
npm run verify
```

- [ ] All checks pass ✅

### 8. Deploy Cloud Functions (Optional - for production)

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

- [ ] Functions deployed

## 🚀 Ready to Go!

Once all steps are complete, run:

```bash
npm run dev
```

Open http://localhost:3000 and start building!

---

## 📞 Need Help?

- **Verify setup**: `npm run verify`
- **Setup credentials**: `npm run setup:credentials`
- **Check docs**: `QUICK_SETUP.md`, `BACKEND_SETUP.md`, `API_DOCUMENTATION.md`

## Common Issues

### "Firebase Admin SDK error"
- Make sure private key has quotes: `FIREBASE_PRIVATE_KEY="-----BEGIN..."`
- Preserve `\n` characters in the key

### "Firestore permission denied"
- Make sure you deployed rules: `firebase deploy --only firestore:rules`
- Check that database is in production mode

### "Authentication not enabled"
- Enable Email/Password in Firebase Console → Authentication

---

**Your Firebase Project:** ask-gene-61b15
**Project Number:** 608606499481
**Logged in as:** yichencai2022@gmail.com
