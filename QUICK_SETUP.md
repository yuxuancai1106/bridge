# Quick Setup Guide for Bridge Backend

Your Firebase client credentials are already configured! Follow these steps to complete the setup.

## 1. Get Firebase Admin SDK Credentials (Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ask-gene-61b15**
3. Click the **gear icon** ⚙️ (Settings) → **Project settings**
4. Go to the **Service accounts** tab
5. Click **"Generate new private key"**
6. Download the JSON file
7. Open the downloaded JSON file and find these values:

```json
{
  "project_id": "ask-gene-61b15",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@ask-gene-61b15.iam.gserviceaccount.com"
}
```

8. Add to your `.env.local` file:
```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ask-gene-61b15.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
```

**Important:** Keep the quotes around the private key and preserve the `\n` characters!

---

## 2. Get Fetch.ai API Key (Required for AI features)

1. Go to [Fetch.ai Platform](https://fetch.ai/platform) or [Agentverse](https://agentverse.ai/)
2. Sign up or log in
3. Navigate to **API Keys** or **Developer Settings**
4. Create a new API key for ASI:One
5. Copy the API key
6. Add to `.env.local`:
```env
NEXT_PUBLIC_FETCH_AI_API_KEY=your_fetch_ai_api_key_here
```

---

## 3. Set up Elasticsearch (Required for search)

### Option A: Quick Start with Docker (Recommended)

```bash
# Pull and run Elasticsearch
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# Wait 30 seconds for it to start, then test
curl http://localhost:9200

# Create the users index
curl -X PUT "localhost:9200/users" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "uid": { "type": "keyword" },
      "name": { "type": "text" },
      "email": { "type": "keyword" },
      "bio": { "type": "text" },
      "interests": { "type": "text" },
      "location": { "type": "keyword" },
      "role": { "type": "keyword" },
      "age": { "type": "integer" }
    }
  }
}'
```

Your `.env.local` is already configured for local Elasticsearch (no password needed).

### Option B: Use Elastic Cloud (Production)

1. Sign up at [Elastic Cloud](https://cloud.elastic.co/)
2. Create a deployment
3. Copy your **Endpoint URL** and **Password**
4. Update `.env.local`:
```env
ELASTICSEARCH_NODE=https://your-deployment.es.region.cloud.provider.com:9243
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_cloud_password
```

---

## 4. Enable Firebase Services

### Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
4. (Optional) Enable **Google** provider

### Set up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Production mode**
4. Select your preferred location (e.g., us-central)
5. Click **Enable**

### Deploy Security Rules

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore
# - Functions
# Choose your project: ask-gene-61b15
# Use default files

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

---

## 5. Set up Firebase Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build the functions
npm run build

# Set environment config for functions
firebase functions:config:set \
  elasticsearch.node="http://localhost:9200" \
  elasticsearch.username="elastic" \
  elasticsearch.password="" \
  fetchai.apikey="YOUR_FETCH_AI_API_KEY"

# Deploy functions
cd ..
firebase deploy --only functions
```

---

## 6. Install Project Dependencies and Run

```bash
# Install main project dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## Quick Test Checklist

✅ Firebase client credentials configured
⬜ Firebase Admin SDK credentials added to `.env.local`
⬜ Fetch.ai API key added to `.env.local`
⬜ Elasticsearch running (docker or cloud)
⬜ Firebase Authentication enabled
⬜ Firestore database created
⬜ Firestore rules deployed
⬜ Cloud Functions deployed (optional, for production)
⬜ `npm install` completed
⬜ `npm run dev` running successfully

---

## Test Your Setup

### Test 1: Sign Up a User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "seeker",
    "interests": ["technology", "music"]
  }'
```

### Test 2: Check Elasticsearch

```bash
# Should show the users index
curl http://localhost:9200/_cat/indices
```

---

## Troubleshooting

### "Firebase Admin SDK error"
- Make sure you added the private key with quotes: `FIREBASE_PRIVATE_KEY="-----BEGIN..."`
- Preserve all `\n` characters in the key

### "Elasticsearch connection refused"
- Check if Elasticsearch is running: `docker ps`
- Verify the port: `curl http://localhost:9200`

### "Fetch.ai API error"
- Verify your API key is valid
- Check you have sufficient API credits/quota

---

## What's Next?

Once everything is running:

1. **Test the signup flow** in your app
2. **Create test users** with different profiles
3. **Generate matches** using the matching algorithm
4. **Try the search** functionality
5. **Send messages** and see the safety analysis in action

See `API_DOCUMENTATION.md` for complete API reference and usage examples.
