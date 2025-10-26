import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// User profile type
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'mentor' | 'seeker';
  age?: number;
  location?: string;
  pronouns?: string;
  interests?: string[];
  bio?: string;
  personality?: {
    extrovert?: number;
    patient?: number;
    humorous?: number;
    empathetic?: number;
  };
  availability?: string[];
  communityScore?: number;
  verified?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  userData: Partial<UserProfile>
): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    if (userData.name) {
      await updateProfile(user, { displayName: userData.name });
    }

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      name: userData.name || '',
      role: userData.role || 'seeker',
      age: userData.age,
      location: userData.location,
      pronouns: userData.pronouns,
      interests: userData.interests || [],
      bio: userData.bio || '',
      personality: userData.personality || {
        extrovert: 5,
        patient: 5,
        humorous: 5,
        empathetic: 5,
      },
      availability: userData.availability || [],
      communityScore: 5.0,
      verified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return userCredential;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw new Error(error.message || 'Failed to create account');
  }
}

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user profile exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      // Create new user profile
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name: user.displayName || '',
        role: 'seeker',
        interests: [],
        bio: '',
        personality: {
          extrovert: 5,
          patient: 5,
          humorous: 5,
          empathetic: 5,
        },
        availability: [],
        communityScore: 5.0,
        verified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', user.uid), userProfile);
    }

    return userCredential;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
}

// Auth state observer
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
