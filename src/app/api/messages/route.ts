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

// Analyze message safety using Fetch.ai
async function analyzeMessageSafety(content: string) {
  const fetchAiApiKey = process.env.NEXT_PUBLIC_FETCH_AI_API_KEY;
  if (!fetchAiApiKey) {
    return { safe: true, safetyScore: 10, concerns: [] };
  }

  try {
    const response = await axios.post(
      'https://agentverse.ai/v1/engine/chat/completions',
      {
        model: 'asi-1',
        messages: [
          {
            role: 'system',
            content:
              'You are a safety moderator. Analyze messages for harmful content, harassment, or inappropriate behavior. Respond with JSON only.',
          },
          {
            role: 'user',
            content: `Analyze this message for safety: "${content}"

Return JSON: {"safe": boolean, "safetyScore": number (0-10), "concerns": [string]}`,
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

    const result = response.data.choices[0].message.content;
    try {
      return JSON.parse(result);
    } catch {
      return { safe: true, safetyScore: 10, concerns: [] };
    }
  } catch (error) {
    console.error('Safety analysis error:', error);
    return { safe: true, safetyScore: 10, concerns: [] };
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request);
    const userId = decodedToken.uid;

    const { conversationId, content } = await request.json();

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    // Verify user is part of conversation
    const convDoc = await adminDb.collection('conversations').doc(conversationId).get();
    if (!convDoc.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conversation = convDoc.data();
    if (!conversation?.participants.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Analyze message safety
    const safetyAnalysis = await analyzeMessageSafety(content);

    // Get sender info
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const senderName = userDoc.data()?.name || 'Unknown';

    // Create message
    const messageData = {
      conversationId,
      senderId: userId,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      safetyChecked: true,
      safetyScore: safetyAnalysis.safetyScore,
      safe: safetyAnalysis.safe,
      concerns: safetyAnalysis.concerns || [],
    };

    const messageRef = await adminDb
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add(messageData);

    // Update conversation's last message
    await adminDb.collection('conversations').doc(conversationId).update({
      lastMessage: content,
      lastMessageAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // If message is unsafe, create a safety report
    if (!safetyAnalysis.safe) {
      await adminDb.collection('safetyAnalysis').add({
        messageId: messageRef.id,
        conversationId,
        senderId: userId,
        content,
        safetyScore: safetyAnalysis.safetyScore,
        concerns: safetyAnalysis.concerns,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      messageId: messageRef.id,
      message: messageData,
      warning: !safetyAnalysis.safe ? 'Message flagged for review' : undefined,
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// GET - Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request);
    const userId = decodedToken.uid;

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 50;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Verify user is part of conversation
    const convDoc = await adminDb.collection('conversations').doc(conversationId).get();
    if (!convDoc.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conversation = convDoc.data();
    if (!conversation?.participants.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get messages
    const messagesSnapshot = await adminDb
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get messages' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
