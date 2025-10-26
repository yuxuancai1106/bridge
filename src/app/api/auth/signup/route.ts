import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, ...userData } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      name,
      role,
      interests: userData.interests || [],
      bio: userData.bio || '',
      age: userData.age,
      location: userData.location,
      pronouns: userData.pronouns,
      personality: userData.personality || {
        extrovert: 5,
        patient: 5,
        humorous: 5,
        empathetic: 5,
      },
      availability: userData.availability || [],
      communityScore: 5.0,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userProfile);

    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
