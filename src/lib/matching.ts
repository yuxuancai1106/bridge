import { User, MatchScore } from './supabase'

export function calculateInterestScore(userA: User, userB: User): number {
  const interestsA = new Set(userA.interests)
  const interestsB = new Set(userB.interests)
  
  const intersection = new Set([...interestsA].filter(x => interestsB.has(x)))
  const union = new Set([...interestsA, ...interestsB])
  
  return union.size > 0 ? intersection.size / union.size : 0
}

export function calculatePersonalityScore(userA: User, userB: User): number {
  const personalityA = userA.personality
  const personalityB = userB.personality
  
  let score = 0
  let totalTraits = 0
  
  // Complementary traits get higher scores
  const complementaryPairs = [
    ['extrovert', 'introvert'],
    ['patient', 'curious'],
    ['humorous', 'empathetic']
  ]
  
  // Check for complementary traits
  for (const [trait1, trait2] of complementaryPairs) {
    if (personalityA[trait1 as keyof typeof personalityA] && 
        !personalityB[trait1 as keyof typeof personalityB]) {
      score += 0.3
    }
    if (personalityB[trait1 as keyof typeof personalityB] && 
        !personalityA[trait1 as keyof typeof personalityA]) {
      score += 0.3
    }
    totalTraits += 1
  }
  
  // Similar traits also get some points
  for (const trait of Object.keys(personalityA)) {
    if (personalityA[trait as keyof typeof personalityA] === 
        personalityB[trait as keyof typeof personalityB]) {
      score += 0.1
    }
    totalTraits += 1
  }
  
  return Math.min(score / totalTraits, 1)
}

export function calculateMotivationScore(userA: User, userB: User): number {
  // Mentor-seeker pairs get higher scores
  if (userA.role === 'mentor' && userB.role === 'seeker') {
    return 0.8
  }
  if (userA.role === 'seeker' && userB.role === 'mentor') {
    return 0.8
  }
  
  // Same role pairs get lower scores
  if (userA.role === userB.role) {
    return 0.2
  }
  
  return 0.5
}

export function calculateLocationScore(userA: User, userB: User): number {
  // For now, assume same location = 1.0, different = 0.5
  // In a real app, you'd use geocoding to calculate actual distance
  return userA.location === userB.location ? 1.0 : 0.5
}

export function findMatches(currentUser: User, allUsers: User[]): MatchScore[] {
  const otherUsers = allUsers.filter(user => user.id !== currentUser.id)
  
  const matches: MatchScore[] = otherUsers.map(user => {
    const interestScore = calculateInterestScore(currentUser, user)
    const personalityScore = calculatePersonalityScore(currentUser, user)
    const motivationScore = calculateMotivationScore(currentUser, user)
    const locationScore = calculateLocationScore(currentUser, user)
    
    // Weighted final score
    const compatibilityScore = 
      interestScore * 0.4 +
      personalityScore * 0.3 +
      motivationScore * 0.2 +
      locationScore * 0.1
    
    // Find common interests
    const commonInterests = currentUser.interests.filter(interest => 
      user.interests.includes(interest)
    )
    
    // Find personality matches
    const personalityMatches = []
    if (currentUser.personality.extrovert && !user.personality.extrovert) {
      personalityMatches.push('Complementary energy levels')
    }
    if (currentUser.personality.patient && user.personality.empathetic) {
      personalityMatches.push('Both caring and understanding')
    }
    if (currentUser.personality.humorous && user.personality.humorous) {
      personalityMatches.push('Both enjoy humor')
    }
    
    // Determine motivation alignment
    let motivationAlignment = ''
    if (currentUser.role === 'mentor' && user.role === 'seeker') {
      motivationAlignment = 'Perfect mentor-mentee match'
    } else if (currentUser.role === 'seeker' && user.role === 'mentor') {
      motivationAlignment = 'Great learning opportunity'
    } else {
      motivationAlignment = 'Peer connection'
    }
    
    return {
      user,
      compatibility_score: compatibilityScore,
      interest_overlap: interestScore,
      personality_score: personalityScore,
      motivation_score: motivationScore,
      location_score: locationScore,
      breakdown: {
        interests: commonInterests,
        personality_match: personalityMatches,
        motivation_alignment: motivationAlignment
      }
    }
  })
  
  // Sort by compatibility score (highest first)
  return matches.sort((a, b) => b.compatibility_score - a.compatibility_score)
}

export function getTopMatches(currentUser: User, allUsers: User[], limit: number = 5): MatchScore[] {
  const matches = findMatches(currentUser, allUsers)
  return matches.slice(0, limit)
}
