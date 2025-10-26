import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import axios from 'axios';

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split('Bearer ')[1];
  return await adminAuth.verifyIdToken(token);
}

// POST - Enhance match with AI analysis using Fetch.ai
export async function POST(request: NextRequest) {
  try {
    await verifyToken(request);

    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    // Get match data
    const matchDoc = await adminDb.collection('matches').doc(matchId).get();
    if (!matchDoc.exists) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const matchData = matchDoc.data();

    // Get user profiles
    const [user1Doc, user2Doc] = await Promise.all([
      adminDb.collection('users').doc(matchData!.user1Id).get(),
      adminDb.collection('users').doc(matchData!.user2Id).get(),
    ]);

    const user1 = user1Doc.data();
    const user2 = user2Doc.data();

    // Call Fetch.ai API for AI analysis
    const fetchAiApiKey = process.env.NEXT_PUBLIC_FETCH_AI_API_KEY;
    if (!fetchAiApiKey) {
      return NextResponse.json(
        { error: 'Fetch.ai API key not configured' },
        { status: 500 }
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
              'You are an expert relationship counselor analyzing compatibility between two people for a mentorship/friendship platform.',
          },
          {
            role: 'user',
            content: `Analyze the compatibility between these two users:

User 1: ${user1?.name}, ${user1?.age || 'N/A'} years old, ${user1?.role}
Interests: ${user1?.interests?.join(', ') || 'None listed'}
Bio: ${user1?.bio || 'No bio'}
Personality: Extrovert ${user1?.personality?.extrovert || 5}/10, Patient ${user1?.personality?.patient || 5}/10, Humorous ${user1?.personality?.humorous || 5}/10, Empathetic ${user1?.personality?.empathetic || 5}/10

User 2: ${user2?.name}, ${user2?.age || 'N/A'} years old, ${user2?.role}
Interests: ${user2?.interests?.join(', ') || 'None listed'}
Bio: ${user2?.bio || 'No bio'}
Personality: Extrovert ${user2?.personality?.extrovert || 5}/10, Patient ${user2?.personality?.patient || 5}/10, Humorous ${user2?.personality?.humorous || 5}/10, Empathetic ${user2?.personality?.empathetic || 5}/10

Provide a structured response with:
1. Compatibility Insights (2-3 sentences about why they're a good match)
2. Conversation Starters (3 specific topics they could discuss)
3. Potential Challenges (1-2 points to be aware of)
4. Advice (1-2 sentences for each user on making the connection successful)`,
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
    await adminDb.collection('matches').doc(matchId).update({
      aiAnalysis,
      aiAnalyzedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
    });
  } catch (error: any) {
    console.error('Enhance match error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enhance match with AI' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
