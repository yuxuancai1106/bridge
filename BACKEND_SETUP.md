# Backend Setup Guide

This guide will help you set up the Firebase, Elasticsearch, and Fetch.ai backend for the Bridge application.

## Prerequisites

- Node.js 18 or higher
- Firebase account
- Fetch.ai API key
- Elasticsearch instance (local or cloud)

## 1. Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `bridge-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

### Enable Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method (optional)
5. Configure OAuth consent screen if using Google

### Set up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Select **Production mode** (we'll add rules later)
4. Choose a location closest to your users
5. Click "Enable"

### Deploy Firestore Security Rules

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select: **Firestore**, **Functions**
   - Choose your Firebase project
   - Use default options for Firestore rules and indexes
   - Select **TypeScript** for Functions
   - Install dependencies: Yes

4. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### Set up Firebase Admin SDK

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values for your `.env` file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

## 2. Elasticsearch Setup

### Option A: Local Elasticsearch

1. Download and install Elasticsearch:
   ```bash
   # Using Docker
   docker pull docker.elastic.co/elasticsearch/elasticsearch:8.11.0

   docker run -d \
     --name elasticsearch \
     -p 9200:9200 \
     -p 9300:9300 \
     -e "discovery.type=single-node" \
     -e "xpack.security.enabled=false" \
     docker.elastic.co/elasticsearch/elasticsearch:8.11.0
   ```

2. Verify Elasticsearch is running:
   ```bash
   curl http://localhost:9200
   ```

3. Create users index:
   ```bash
   curl -X PUT "localhost:9200/users" -H 'Content-Type: application/json' -d'
   {
     "settings": {
       "number_of_shards": 1,
       "number_of_replicas": 0
     },
     "mappings": {
       "properties": {
         "uid": { "type": "keyword" },
         "name": { "type": "text" },
         "email": { "type": "keyword" },
         "bio": { "type": "text" },
         "interests": { "type": "text" },
         "location": { "type": "keyword" },
         "role": { "type": "keyword" },
         "age": { "type": "integer" },
         "createdAt": { "type": "date" },
         "updatedAt": { "type": "date" }
       }
     }
   }'
   ```

### Option B: Elastic Cloud

1. Sign up at [Elastic Cloud](https://cloud.elastic.co/)
2. Create a deployment
3. Choose your cloud provider and region
4. Note your **Cloud ID** and **Password**
5. Update `.env` with cloud credentials:
   ```
   ELASTICSEARCH_NODE=https://your-deployment.es.region.cloud.provider.com:9243
   ELASTICSEARCH_USERNAME=elastic
   ELASTICSEARCH_PASSWORD=your_password
   ```

## 3. Fetch.ai Setup

1. Go to [Fetch.ai ASI:One](https://fetch.ai/platform)
2. Sign up or log in
3. Navigate to API keys section
4. Generate a new API key
5. Copy the API key for your `.env` file

## 4. Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all the values in `.env.local`:
   ```env
   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bridge-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=bridge-app
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bridge-app.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=bridge-app
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bridge-app.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # Fetch.ai
   NEXT_PUBLIC_FETCH_AI_API_KEY=fetch_ai_key_here

   # Elasticsearch
   ELASTICSEARCH_NODE=http://localhost:9200
   ELASTICSEARCH_USERNAME=elastic
   ELASTICSEARCH_PASSWORD=changeme
   ```

## 5. Deploy Firebase Cloud Functions

1. Navigate to the functions directory:
   ```bash
   cd functions
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set environment variables for Cloud Functions:
   ```bash
   firebase functions:config:set \
     elasticsearch.node="http://your-elasticsearch-url:9200" \
     elasticsearch.username="elastic" \
     elasticsearch.password="your_password" \
     fetchai.apikey="your_fetch_ai_api_key"
   ```

4. Build and deploy functions:
   ```bash
   npm run build
   cd ..
   firebase deploy --only functions
   ```

## 6. Install Dependencies and Run

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## 7. Testing the Backend

### Test Authentication

```bash
# Sign up a new user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "seeker"
  }'
```

### Test Matching Algorithm

```bash
# Generate matches (requires authentication token)
curl -X POST http://localhost:3000/api/matches \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Search

```bash
# Search users
curl "http://localhost:3000/api/search?q=tennis&role=mentor" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  - React Components                                         │
│  - Firebase Auth Client                                     │
│  - API Route Handlers                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Services Layer                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Firebase   │  │ Elasticsearch│  │  Fetch.ai    │    │
│  │              │  │              │  │              │    │
│  │ • Auth       │  │ • Search     │  │ • AI Match   │    │
│  │ • Firestore  │  │ • Indexing   │  │ • Safety     │    │
│  │ • Functions  │  │ • Analytics  │  │ • Insights   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update user profile

### Matching
- `GET /api/matches` - Get user's matches
- `POST /api/matches` - Generate new matches
- `POST /api/matches/enhance` - Enhance match with AI analysis

### Search
- `GET /api/search?q=query&role=mentor` - Search users

### Messages
- `GET /api/messages?conversationId=xxx` - Get conversation messages
- `POST /api/messages` - Send a message

## Troubleshooting

### Firebase Connection Issues
- Verify API keys are correct in `.env.local`
- Check Firebase Console for service status
- Ensure Firestore database is created

### Elasticsearch Connection Issues
- Verify Elasticsearch is running: `curl http://localhost:9200`
- Check credentials in `.env.local`
- For cloud: verify network access and API keys

### Fetch.ai API Issues
- Verify API key is valid
- Check API quota and rate limits
- Review Fetch.ai dashboard for errors

### Cloud Functions Deployment Errors
- Ensure Firebase CLI is up to date: `npm install -g firebase-tools@latest`
- Check function logs: `firebase functions:log`
- Verify all environment variables are set

## Next Steps

1. Customize Firestore security rules for your use case
2. Set up Firebase indexes for better query performance
3. Configure Cloud Functions triggers for real-time features
4. Set up monitoring and analytics
5. Deploy to production

## Support

For issues or questions:
- Firebase: [Firebase Documentation](https://firebase.google.com/docs)
- Elasticsearch: [Elastic Documentation](https://www.elastic.co/guide)
- Fetch.ai: [Fetch.ai Docs](https://fetch.ai/docs)
