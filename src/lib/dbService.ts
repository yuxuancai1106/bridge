import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from './authService';

// Match interface
export interface Match {
  id?: string;
  user1Id: string;
  user2Id: string;
  compatibilityScore: number;
  interestScore: number;
  personalityScore: number;
  motivationScore: number;
  locationScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: any;
  updatedAt?: any;
}

// Conversation interface
export interface Conversation {
  id?: string;
  participants: string[];
  participantDetails?: {
    [key: string]: {
      name: string;
      role: string;
    };
  };
  lastMessage?: string;
  lastMessageAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

// Message interface
export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp?: any;
  safetyChecked?: boolean;
  safetyScore?: number;
}

// Report interface
export interface Report {
  id?: string;
  reporterId: string;
  reportedUserId: string;
  conversationId?: string;
  messageId?: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt?: any;
}

// ===== USER OPERATIONS =====

export async function createUser(userId: string, userData: UserProfile) {
  await setDoc(doc(db, 'users', userId), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUser(userId: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return { ...userDoc.data(), uid: userDoc.id } as UserProfile;
  }
  return null;
}

export async function updateUser(userId: string, updates: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  return usersSnapshot.docs.map(doc => ({
    ...doc.data(),
    uid: doc.id,
  })) as UserProfile[];
}

export async function getUsersByRole(role: 'mentor' | 'seeker'): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), where('role', '==', role));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    uid: doc.id,
  })) as UserProfile[];
}

// ===== MATCH OPERATIONS =====

export async function createMatch(matchData: Match) {
  const matchRef = await addDoc(collection(db, 'matches'), {
    ...matchData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return matchRef.id;
}

export async function getMatch(matchId: string): Promise<Match | null> {
  const matchDoc = await getDoc(doc(db, 'matches', matchId));
  if (matchDoc.exists()) {
    return { ...matchDoc.data(), id: matchDoc.id } as Match;
  }
  return null;
}

export async function getUserMatches(userId: string): Promise<Match[]> {
  const q1 = query(
    collection(db, 'matches'),
    where('user1Id', '==', userId),
    orderBy('compatibilityScore', 'desc')
  );
  const q2 = query(
    collection(db, 'matches'),
    where('user2Id', '==', userId),
    orderBy('compatibilityScore', 'desc')
  );

  const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  const matches = [
    ...snapshot1.docs.map(doc => ({ ...doc.data(), id: doc.id } as Match)),
    ...snapshot2.docs.map(doc => ({ ...doc.data(), id: doc.id } as Match)),
  ];

  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

export async function updateMatch(matchId: string, updates: Partial<Match>) {
  await updateDoc(doc(db, 'matches', matchId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// ===== MATCHING ALGORITHM =====

export function calculateMatchingScore(user1: UserProfile, user2: UserProfile) {
  // Interest matching (40% weight)
  const user1Interests = new Set(user1.interests || []);
  const user2Interests = new Set(user2.interests || []);
  const commonInterests = [...user1Interests].filter(i => user2Interests.has(i));
  const interestScore = user1Interests.size > 0 && user2Interests.size > 0
    ? (commonInterests.length / Math.max(user1Interests.size, user2Interests.size)) * 10
    : 5;

  // Personality matching (30% weight)
  const personality1 = user1.personality || { extrovert: 5, patient: 5, humorous: 5, empathetic: 5 };
  const personality2 = user2.personality || { extrovert: 5, patient: 5, humorous: 5, empathetic: 5 };

  const personalityDiff = Math.sqrt(
    Math.pow((personality1.extrovert || 5) - (personality2.extrovert || 5), 2) +
    Math.pow((personality1.patient || 5) - (personality2.patient || 5), 2) +
    Math.pow((personality1.humorous || 5) - (personality2.humorous || 5), 2) +
    Math.pow((personality1.empathetic || 5) - (personality2.empathetic || 5), 2)
  );
  const personalityScore = Math.max(0, 10 - (personalityDiff / 4));

  // Role motivation matching (20% weight)
  const motivationScore = user1.role !== user2.role ? 10 : 5;

  // Location matching (10% weight)
  const locationScore = user1.location === user2.location ? 10 : 5;

  // Calculate total score
  const totalScore =
    interestScore * 0.4 +
    personalityScore * 0.3 +
    motivationScore * 0.2 +
    locationScore * 0.1;

  return {
    compatibilityScore: Math.round(totalScore * 10) / 10,
    interestScore: Math.round(interestScore * 10) / 10,
    personalityScore: Math.round(personalityScore * 10) / 10,
    motivationScore: Math.round(motivationScore * 10) / 10,
    locationScore: Math.round(locationScore * 10) / 10,
  };
}

export async function findMatchesForUser(userId: string, maxMatches: number = 10): Promise<(UserProfile & { matchScores: ReturnType<typeof calculateMatchingScore> })[]> {
  const currentUser = await getUser(userId);
  if (!currentUser) return [];

  // Get all other users
  const allUsers = await getAllUsers();
  const otherUsers = allUsers.filter(u => u.uid !== userId);

  // Calculate scores for each user
  const usersWithScores = otherUsers.map(user => ({
    ...user,
    matchScores: calculateMatchingScore(currentUser, user)
  }));

  // Sort by compatibility score and return top matches
  return usersWithScores
    .sort((a, b) => b.matchScores.compatibilityScore - a.matchScores.compatibilityScore)
    .slice(0, maxMatches);
}

// ===== CONVERSATION OPERATIONS =====

export async function createConversation(participants: string[]): Promise<string> {
  // Check if conversation already exists
  const q = query(
    collection(db, 'conversations'),
    where('participants', '==', participants)
  );
  const existing = await getDocs(q);

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  // Create new conversation
  const convRef = await addDoc(collection(db, 'conversations'), {
    participants,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return convRef.id;
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const convDoc = await getDoc(doc(db, 'conversations', conversationId));
  if (convDoc.exists()) {
    return { ...convDoc.data(), id: convDoc.id } as Conversation;
  }
  return null;
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) as Conversation[];
}

export async function updateConversation(
  conversationId: string,
  updates: Partial<Conversation>
) {
  await updateDoc(doc(db, 'conversations', conversationId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// ===== MESSAGE OPERATIONS =====

export async function createMessage(messageData: Message): Promise<string> {
  const messageRef = await addDoc(
    collection(db, 'conversations', messageData.conversationId, 'messages'),
    {
      ...messageData,
      timestamp: serverTimestamp(),
    }
  );

  // Update conversation's last message
  await updateConversation(messageData.conversationId, {
    lastMessage: messageData.content,
    lastMessageAt: serverTimestamp(),
  });

  return messageRef.id;
}

export async function getMessages(
  conversationId: string,
  limitCount: number = 50
): Promise<Message[]> {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) as Message[];
}

// ===== REPORT OPERATIONS =====

export async function createReport(reportData: Report): Promise<string> {
  const reportRef = await addDoc(collection(db, 'reports'), {
    ...reportData,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return reportRef.id;
}

export async function getReport(reportId: string): Promise<Report | null> {
  const reportDoc = await getDoc(doc(db, 'reports', reportId));
  if (reportDoc.exists()) {
    return { ...reportDoc.data(), id: reportDoc.id } as Report;
  }
  return null;
}
