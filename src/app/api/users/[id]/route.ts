import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

// Verify Firebase token from request
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split('Bearer ')[1];
  return await adminAuth.verifyIdToken(token);
}

// GET user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyToken(request);

    const userId = params.id;
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: { ...userDoc.data(), uid: userDoc.id },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// UPDATE user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decodedToken = await verifyToken(request);
    const userId = params.id;

    // Ensure user can only update their own profile
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await request.json();

    // Remove fields that shouldn't be updated
    delete updates.uid;
    delete updates.createdAt;

    await adminDb
      .collection('users')
      .doc(userId)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
