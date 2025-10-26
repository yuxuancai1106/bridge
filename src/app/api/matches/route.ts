import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split('Bearer ')[1];
  return await adminAuth.verifyIdToken(token);
}

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

function calculateInterestScore(interests1: string[], interests2: string[]): number {
  if (!interests1?.length || !interests2?.length) return 5;

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

function calculateMatchingScore(user1: UserProfile, user2: UserProfile) {
  const interestScore = calculateInterestScore(user1.interests, user2.interests);
  const personalityScore = calculatePersonalityScore(user1.personality, user2.personality);

  const motivationScore =
    user1.role !== user2.role && (user1.role === 'mentor' || user2.role === 'mentor')
      ? 10
      : 5;

  const locationScore =
    user1.location && user2.location && user1.location === user2.location ? 10 : 5;

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

// GET matches for current user
export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request);
    const userId = decodedToken.uid;

    // Get user's existing matches
    const matchesSnapshot = await adminDb
      .collection('matches')
      .where('user1Id', '==', userId)
      .get();

    const matches2Snapshot = await adminDb
      .collection('matches')
      .where('user2Id', '==', userId)
      .get();

    const matches = [
      ...matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...matches2Snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    ];

    return NextResponse.json({
      success: true,
      matches,
    });
  } catch (error: any) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get matches' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// POST - Generate new matches for current user
export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request);
    const userId = decodedToken.uid;

    // Get user profile
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userProfile = { uid: userDoc.id, ...userDoc.data() } as UserProfile;

    // Get all other users
    const usersSnapshot = await adminDb.collection('users').get();
    const matches = [];

    for (const doc of usersSnapshot.docs) {
      if (doc.id === userId) continue;

      const otherUser = { uid: doc.id, ...doc.data() } as UserProfile;

      // Calculate matching score
      const scores = calculateMatchingScore(userProfile, otherUser);

      // Save match if score is above threshold
      if (scores.compatibilityScore >= 5) {
        const matchData = {
          user1Id: userId,
          user2Id: otherUser.uid,
          ...scores,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const matchRef = await adminDb.collection('matches').add(matchData);
        matches.push({ id: matchRef.id, ...matchData, user: otherUser });
      }
    }

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return NextResponse.json({
      success: true,
      matchCount: matches.length,
      matches: matches.slice(0, 10), // Return top 10 matches
    });
  } catch (error: any) {
    console.error('Generate matches error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate matches' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
