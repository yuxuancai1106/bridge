import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Client } from '@elastic/elasticsearch';
import axios from 'axios';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Initialize Elasticsearch
const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
});

// ===== AUTHENTICATION FUNCTIONS =====

// Trigger when a new user is created
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    // Index user in Elasticsearch
    await elasticClient.index({
      index: 'users',
      id: user.uid,
      document: {
        uid: user.uid,
        email: user.email,
        name: user.displayName || '',
        createdAt: new Date(),
      },
    });

    console.log(`User ${user.uid} indexed in Elasticsearch`);
  } catch (error) {
    console.error('Error indexing user:', error);
  }
});

// Trigger when a user is deleted
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user from Firestore
    await db.collection('users').doc(user.uid).delete();

    // Delete user from Elasticsearch
    await elasticClient.delete({
      index: 'users',
      id: user.uid,
    });

    console.log(`User ${user.uid} deleted from database and search index`);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
});

// ===== USER PROFILE FUNCTIONS =====

// Sync user profile updates to Elasticsearch
export const onUserProfileUpdated = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const newData = change.after.data();

    try {
      await elasticClient.update({
        index: 'users',
        id: userId,
        doc: {
          name: newData.name,
          bio: newData.bio,
          interests: newData.interests,
          location: newData.location,
          role: newData.role,
          age: newData.age,
          updatedAt: new Date(),
        },
      });

      console.log(`User ${userId} updated in Elasticsearch`);
    } catch (error) {
      console.error('Error updating user in Elasticsearch:', error);
    }
  });

// ===== MATCHING FUNCTIONS =====

interface UserProfile {
  uid: string;
  role: 'mentor' | 'seeker';
  interests: string[];
  personality: {
    extrovert?: number;
    patient?: number;
    humorous?: number;
    empathetic?: number;
  };
  location?: string;
  age?: number;
}

// Calculate matching score
function calculateMatchingScore(user1: UserProfile, user2: UserProfile) {
  // Interest Score (40% weight)
  const interestScore = calculateInterestScore(user1.interests, user2.interests);

  // Personality Score (30% weight)
  const personalityScore = calculatePersonalityScore(
    user1.personality,
    user2.personality
  );

  // Motivation Score (20% weight) - mentor-seeker pairing
  const motivationScore =
    user1.role !== user2.role && (user1.role === 'mentor' || user2.role === 'mentor')
      ? 10
      : 5;

  // Location Score (10% weight)
  const locationScore =
    user1.location && user2.location && user1.location === user2.location ? 10 : 5;

  // Calculate weighted total
  const totalScore =
    interestScore * 0.4 +
    personalityScore * 0.3 +
    motivationScore * 0.2 +
    locationScore * 0.1;

  return {
    compatibilityScore: Math.round(totalScore * 10) / 10,
    interestScore,
    personalityScore,
    motivationScore,
    locationScore,
  };
}

function calculateInterestScore(interests1: string[], interests2: string[]): number {
  if (!interests1.length || !interests2.length) return 5;

  const set1 = new Set(interests1);
  const set2 = new Set(interests2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));

  const union = new Set([...set1, ...set2]);
  const jaccardSimilarity = intersection.size / union.size;

  return Math.round(jaccardSimilarity * 100) / 10;
}

function calculatePersonalityScore(
  p1: UserProfile['personality'],
  p2: UserProfile['personality']
): number {
  const traits = ['extrovert', 'patient', 'humorous', 'empathetic'] as const;
  let totalDiff = 0;

  for (const trait of traits) {
    const val1 = p1[trait] || 5;
    const val2 = p2[trait] || 5;
    totalDiff += Math.abs(val1 - val2);
  }

  const avgDiff = totalDiff / traits.length;
  const score = 10 - avgDiff;

  return Math.max(0, Math.round(score * 10) / 10);
}

// Generate matches for a user
export const generateMatches = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    // Get user profile
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }

    const userProfile = userDoc.data() as UserProfile;

    // Get all other users (exclude self)
    const usersSnapshot = await db
      .collection('users')
      .where('uid', '!=', userId)
      .get();

    const matches = [];

    for (const doc of usersSnapshot.docs) {
      const otherUser = doc.data() as UserProfile;

      // Calculate matching score
      const scores = calculateMatchingScore(userProfile, otherUser);

      // Save match if score is above threshold
      if (scores.compatibilityScore >= 5) {
        const matchData = {
          user1Id: userId,
          user2Id: otherUser.uid,
          ...scores,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection('matches').add(matchData);
        matches.push({ ...matchData, user: otherUser });
      }
    }

    return {
      success: true,
      matchCount: matches.length,
      matches: matches.slice(0, 10), // Return top 10 matches
    };
  } catch (error: any) {
    console.error('Error generating matches:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ===== LLM-ENHANCED MATCHING =====

// Generate AI-enhanced match analysis using Fetch.ai
export const enhanceMatchWithAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { matchId } = data;

  try {
    // Get match data
    const matchDoc = await db.collection('matches').doc(matchId).get();
    if (!matchDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Match not found');
    }

    const matchData = matchDoc.data();

    // Get user profiles
    const [user1Doc, user2Doc] = await Promise.all([
      db.collection('users').doc(matchData!.user1Id).get(),
      db.collection('users').doc(matchData!.user2Id).get(),
    ]);

    const user1 = user1Doc.data();
    const user2 = user2Doc.data();

    // Call Fetch.ai API for AI analysis
    const fetchAiApiKey = process.env.FETCH_AI_API_KEY;
    if (!fetchAiApiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Fetch.ai API key not configured'
      );
    }

    const response = await axios.post(
      'https://agentverse.ai/v1/engine/chat/completions',
      {
        model: 'asi-1',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert relationship counselor analyzing compatibility between two people.',
          },
          {
            role: 'user',
            content: `Analyze the compatibility between these two users:

User 1: ${user1?.name}, ${user1?.age} years old, ${user1?.role}
Interests: ${user1?.interests.join(', ')}
Bio: ${user1?.bio}
Personality: Extrovert ${user1?.personality.extrovert}/10, Patient ${user1?.personality.patient}/10

User 2: ${user2?.name}, ${user2?.age} years old, ${user2?.role}
Interests: ${user2?.interests.join(', ')}
Bio: ${user2?.bio}
Personality: Extrovert ${user2?.personality.extrovert}/10, Patient ${user2?.personality.patient}/10

Provide:
1. Compatibility insights (2-3 sentences)
2. Conversation starters (3 topics)
3. Potential challenges (1-2 points)
4. Advice for both users (1-2 sentences each)`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${fetchAiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiAnalysis = response.data.choices[0].message.content;

    // Save AI analysis to match
    await db.collection('matches').doc(matchId).update({
      aiAnalysis,
      aiAnalyzedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      analysis: aiAnalysis,
    };
  } catch (error: any) {
    console.error('Error enhancing match with AI:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ===== SEARCH FUNCTIONS =====

// Search users using Elasticsearch
export const searchUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { query, filters } = data;

  try {
    const searchQuery: any = {
      bool: {
        must: [
          {
            multi_match: {
              query,
              fields: ['name', 'bio', 'interests', 'location'],
              fuzziness: 'AUTO',
            },
          },
        ],
      },
    };

    if (filters) {
      searchQuery.bool.filter = Object.entries(filters).map(([key, value]) => ({
        term: { [key]: value },
      }));
    }

    const { hits } = await elasticClient.search({
      index: 'users',
      query: searchQuery,
    });

    const results = hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source,
    }));

    return {
      success: true,
      results,
    };
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ===== MESSAGE SAFETY FUNCTIONS =====

// Analyze message safety using Fetch.ai
export const analyzeMessageSafety = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { messageContent } = data;

  try {
    const fetchAiApiKey = process.env.FETCH_AI_API_KEY;
    if (!fetchAiApiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Fetch.ai API key not configured'
      );
    }

    const response = await axios.post(
      'https://agentverse.ai/v1/engine/chat/completions',
      {
        model: 'asi-1',
        messages: [
          {
            role: 'system',
            content:
              'You are a safety moderator. Analyze messages for harmful content, harassment, or inappropriate behavior.',
          },
          {
            role: 'user',
            content: `Analyze this message for safety concerns: "${messageContent}"

Return a JSON response with:
- safe: boolean
- safetyScore: number (0-10, 10 being safest)
- concerns: array of strings
- recommendation: string`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${fetchAiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const analysis = response.data.choices[0].message.content;

    return {
      success: true,
      analysis,
    };
  } catch (error: any) {
    console.error('Error analyzing message safety:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
