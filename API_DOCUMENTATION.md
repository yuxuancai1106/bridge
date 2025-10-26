# Bridge Backend API Documentation

Complete API reference for the Bridge backend services.

## Authentication

All API routes (except signup) require a Firebase authentication token in the `Authorization` header:

```
Authorization: Bearer <firebase_id_token>
```

Get the token from Firebase Auth:
```typescript
import { auth } from '@/lib/firebase';

const token = await auth.currentUser?.getIdToken();
```

---

## API Endpoints

### Authentication

#### Sign Up
Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "seeker",  // or "mentor"
  "age": 25,
  "location": "San Francisco, CA",
  "pronouns": "he/him",
  "interests": ["technology", "hiking", "photography"],
  "bio": "Looking to learn and grow",
  "personality": {
    "extrovert": 7,
    "patient": 8,
    "humorous": 6,
    "empathetic": 9
  },
  "availability": ["weekday-evenings", "weekends"]
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'password123',
    name: 'New User',
    role: 'seeker',
    interests: ['music', 'sports']
  })
});

const data = await response.json();
```

---

### Users

#### Get User Profile
Retrieve a user's profile by ID.

**Endpoint:** `GET /api/users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "seeker",
    "age": 25,
    "location": "San Francisco, CA",
    "interests": ["technology", "hiking"],
    "bio": "Looking to learn and grow",
    "personality": {
      "extrovert": 7,
      "patient": 8,
      "humorous": 6,
      "empathetic": 9
    },
    "communityScore": 5.0,
    "verified": false
  }
}
```

**Example:**
```typescript
const token = await auth.currentUser?.getIdToken();

const response = await fetch(`/api/users/${userId}`, {
  headers: { Authorization: `Bearer ${token}` }
});

const data = await response.json();
```

#### Update User Profile
Update the current user's profile.

**Endpoint:** `PATCH /api/users/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "name": "John Updated",
  "bio": "New bio text",
  "interests": ["new", "interests"],
  "location": "New York, NY",
  "personality": {
    "extrovert": 8,
    "patient": 9
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Example:**
```typescript
const token = await auth.currentUser?.getIdToken();

await fetch(`/api/users/${userId}`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bio: 'Updated bio',
    interests: ['coding', 'reading']
  })
});
```

---

### Matching

#### Get User's Matches
Retrieve all matches for the current user.

**Endpoint:** `GET /api/matches`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "id": "match123",
      "user1Id": "currentUser",
      "user2Id": "otherUser",
      "compatibilityScore": 8.5,
      "interestScore": 9.0,
      "personalityScore": 8.0,
      "motivationScore": 10.0,
      "locationScore": 5.0,
      "status": "pending",
      "createdAt": "2025-10-25T10:00:00Z"
    }
  ]
}
```

**Example:**
```typescript
const token = await auth.currentUser?.getIdToken();

const response = await fetch('/api/matches', {
  headers: { Authorization: `Bearer ${token}` }
});

const { matches } = await response.json();
```

#### Generate New Matches
Generate fresh matches for the current user based on their profile.

**Endpoint:** `POST /api/matches`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "matchCount": 8,
  "matches": [
    {
      "id": "match123",
      "user1Id": "currentUser",
      "user2Id": "otherUser",
      "compatibilityScore": 8.5,
      "interestScore": 9.0,
      "personalityScore": 8.0,
      "motivationScore": 10.0,
      "locationScore": 5.0,
      "status": "pending",
      "user": {
        "uid": "otherUser",
        "name": "Jane Smith",
        "role": "mentor",
        "interests": ["technology", "mentoring"]
      }
    }
  ]
}
```

**Example:**
```typescript
const token = await auth.currentUser?.getIdToken();

const response = await fetch('/api/matches', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

const { matches, matchCount } = await response.json();
console.log(`Generated ${matchCount} new matches!`);
```

#### Enhance Match with AI
Get AI-powered insights about a specific match using Fetch.ai.

**Endpoint:** `POST /api/matches/enhance`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "matchId": "match123"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "AI-generated compatibility analysis, conversation starters, potential challenges, and advice for both users."
}
```

**Example:**
```typescript
const token = await auth.currentUser?.getIdToken();

const response = await fetch('/api/matches/enhance', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ matchId: 'match123' })
});

const { analysis } = await response.json();
console.log(analysis);
```

---

### Search

#### Search Users
Search for users using Elasticsearch with advanced filtering.

**Endpoint:** `GET /api/search`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (string): Search query for name, bio, interests, location
- `role` (string, optional): Filter by role ("mentor" or "seeker")
- `location` (string, optional): Filter by location
- `interests` (string, optional): Comma-separated interests to filter by

**Example URL:**
```
/api/search?q=technology&role=mentor&interests=coding,ai
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "results": [
    {
      "id": "user123",
      "score": 1.5,
      "uid": "user123",
      "name": "Jane Smith",
      "bio": "Tech mentor with 10 years experience",
      "interests": ["technology", "coding", "ai"],
      "role": "mentor",
      "location": "San Francisco, CA"
    }
  ]
}
```

**Example:**
```typescript
const token = await auth.currentUser?.getIdToken();

const params = new URLSearchParams({
  q: 'photography',
  role: 'mentor',
  interests: 'photography,art'
});

const response = await fetch(`/api/search?${params}`, {
  headers: { Authorization: `Bearer ${token}` }
});

const { results, count } = await response.json();
console.log(`Found ${count} matching users`);
```

---

### Messages

#### Send Message
Send a message in a conversation. Message is automatically analyzed for safety using Fetch.ai.

**Endpoint:** `POST /api/messages`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "conversationId": "conv123",
  "content": "Hello! I'd love to connect and learn from your experience."
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg123",
  "message": {
    "conversationId": "conv123",
    "senderId": "user123",
    "senderName": "John Doe",
    "content": "Hello! I'd love to connect...",
    "timestamp": "2025-10-25T10:30:00Z",
    "safetyChecked": true,
    "safetyScore": 10,
    "safe": true,
    "concerns": []
  },
  "warning": null
}
```

If message is flagged as unsafe:
```json
{
  "success": true,
  "messageId": "msg124",
  "message": { ... },
  "warning": "Message flagged for review"
}
```

**Example:**
```typescript
const token = await auth.currentUser?.getIdToken();

const response = await fetch('/api/messages', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    conversationId: conversationId,
    content: messageText
  })
});

const { message, warning } = await response.json();
if (warning) {
  console.warn(warning);
}
```

#### Get Messages
Retrieve messages from a conversation.

**Endpoint:** `GET /api/messages`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `conversationId` (required): The conversation ID
- `limit` (optional, default: 50): Maximum number of messages to retrieve

**Example URL:**
```
/api/messages?conversationId=conv123&limit=100
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg1",
      "conversationId": "conv123",
      "senderId": "user123",
      "senderName": "John Doe",
      "content": "Hello!",
      "timestamp": "2025-10-25T10:00:00Z",
      "safetyChecked": true,
      "safetyScore": 10,
      "safe": true
    },
    {
      "id": "msg2",
      "conversationId": "conv123",
      "senderId": "user456",
      "senderName": "Jane Smith",
      "content": "Hi there!",
      "timestamp": "2025-10-25T10:05:00Z",
      "safetyChecked": true,
      "safetyScore": 10,
      "safe": true
    }
  ]
}
```

**Example:**
```typescript
const token = await auth.currentUser?.getIdToken();

const response = await fetch(
  `/api/messages?conversationId=${conversationId}&limit=50`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);

const { messages } = await response.json();
```

---

## Client-Side Services

### Authentication Service

Import from `@/lib/authService.ts`:

```typescript
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  resetPassword,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  onAuthStateChange
} from '@/lib/authService';

// Sign up
const userCredential = await signUpWithEmail(
  'user@example.com',
  'password123',
  {
    name: 'John Doe',
    role: 'seeker',
    interests: ['coding', 'music']
  }
);

// Sign in
const cred = await signInWithEmail('user@example.com', 'password123');

// Sign in with Google
const googleCred = await signInWithGoogle();

// Get current user
const user = getCurrentUser();

// Get user profile
const profile = await getUserProfile(user.uid);

// Update profile
await updateUserProfile(user.uid, {
  bio: 'Updated bio',
  interests: ['new', 'interests']
});

// Listen to auth state
const unsubscribe = onAuthStateChange((user) => {
  if (user) {
    console.log('User signed in:', user.uid);
  } else {
    console.log('User signed out');
  }
});
```

### Database Service

Import from `@/lib/dbService.ts`:

```typescript
import {
  createUser,
  getUser,
  updateUser,
  getAllUsers,
  getUsersByRole,
  createMatch,
  getMatch,
  getUserMatches,
  createConversation,
  getConversation,
  getUserConversations,
  createMessage,
  getMessages,
  createReport
} from '@/lib/dbService';

// Get user
const user = await getUser('user123');

// Get all mentors
const mentors = await getUsersByRole('mentor');

// Get user matches
const matches = await getUserMatches('user123');

// Create conversation
const conversationId = await createConversation(['user1', 'user2']);

// Get messages
const messages = await getMessages('conv123', 50);

// Send message
const messageId = await createMessage({
  conversationId: 'conv123',
  senderId: 'user123',
  senderName: 'John',
  content: 'Hello!'
});
```

### Elasticsearch Service

Import from `@/lib/elasticsearch.ts`:

```typescript
import {
  indexUserProfile,
  searchUsers,
  updateUserInIndex,
  deleteUserFromIndex
} from '@/lib/elasticsearch';

// Index a user
await indexUserProfile('user123', {
  name: 'John Doe',
  bio: 'Software engineer',
  interests: ['coding', 'music'],
  role: 'mentor'
});

// Search users
const results = await searchUsers('photography', {
  role: 'mentor'
});
```

---

## Error Handling

All API endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (user lacks permission)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (e.g., Elasticsearch down)

**Example Error Handling:**
```typescript
try {
  const response = await fetch('/api/matches', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  const data = await response.json();
  // Handle success
} catch (error) {
  console.error('API Error:', error.message);
  // Show error to user
}
```

---

## Rate Limits

- API Routes: No built-in limits (add if needed)
- Fetch.ai API: Check your plan limits
- Elasticsearch: Depends on your deployment

---

## Security Notes

1. **Never expose Firebase Admin credentials** in client-side code
2. **Always validate tokens** on the server side
3. **Firestore security rules** enforce user isolation
4. **Messages are automatically analyzed** for safety before being saved
5. **Users can only access** their own data and matched users' data

---

## Testing

Use the included Postman collection or test with curl:

```bash
# Get auth token first from Firebase
export TOKEN="your_firebase_token"

# Test search
curl "http://localhost:3000/api/search?q=music" \
  -H "Authorization: Bearer $TOKEN"

# Test matches
curl -X POST "http://localhost:3000/api/matches" \
  -H "Authorization: Bearer $TOKEN"

# Test messages
curl -X POST "http://localhost:3000/api/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"conv123","content":"Hello!"}'
```

---

## Support

For issues or questions about the API, refer to:
- [Backend Setup Guide](./BACKEND_SETUP.md)
- Firebase Documentation
- Elasticsearch Documentation
- Fetch.ai Documentation
