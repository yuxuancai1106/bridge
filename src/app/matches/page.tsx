'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, MapPin, Clock, Star, Shield } from 'lucide-react'
import { User, MatchScore } from '@/lib/supabase'
import { getTopMatches } from '@/lib/matching'

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchScore[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    // Mock data for demo - in real app, this would come from your API
    const mockCurrentUser: User = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'mary@example.com',
      name: 'Mary Johnson',
      age: 67,
      location: 'Berkeley, CA',
      pronouns: 'she/her',
      role: 'mentor',
      interests: ['gardening', 'cooking', 'reading', 'volunteering'],
      personality: {
        extrovert: true,
        patient: true,
        humorous: true,
        empathetic: true
      },
      availability: {
        preferred_times: ['morning', 'afternoon'],
        communication_mode: 'both'
      },
      motivation: 'I want to share my life experience and help young people navigate their careers and personal growth.',
      housing_offering: true,
      housing_seeking: false,
      verified: true,
      community_score: 4.8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const mockUsers: User[] = [
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'alex@berkeley.edu',
        name: 'Alex Chen',
        age: 22,
        location: 'Berkeley, CA',
        pronouns: 'they/them',
        role: 'seeker',
        interests: ['technology', 'cooking', 'travel', 'photography'],
        personality: {
          extrovert: false,
          patient: false,
          humorous: true,
          empathetic: true
        },
        availability: {
          preferred_times: ['evening', 'weekend'],
          communication_mode: 'video'
        },
        motivation: 'I want to learn from experienced professionals and find mentorship in my career journey.',
        housing_offering: false,
        housing_seeking: true,
        verified: true,
        community_score: 4.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'sarah@stanford.edu',
        name: 'Sarah Williams',
        age: 21,
        location: 'Palo Alto, CA',
        pronouns: 'she/her',
        role: 'seeker',
        interests: ['art', 'reading', 'volunteering', 'music'],
        personality: {
          extrovert: true,
          patient: true,
          humorous: false,
          empathetic: true
        },
        availability: {
          preferred_times: ['afternoon', 'evening'],
          communication_mode: 'both'
        },
        motivation: 'Looking for guidance in pursuing a career in education and making a positive impact.',
        housing_offering: false,
        housing_seeking: false,
        verified: true,
        community_score: 4.7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'david@example.com',
        name: 'David Rodriguez',
        age: 65,
        location: 'San Francisco, CA',
        pronouns: 'he/him',
        role: 'mentor',
        interests: ['business', 'technology', 'travel', 'cooking'],
        personality: {
          extrovert: true,
          patient: true,
          humorous: true,
          empathetic: false
        },
        availability: {
          preferred_times: ['morning', 'weekend'],
          communication_mode: 'in-person'
        },
        motivation: 'Retired tech executive wanting to help young entrepreneurs and share business insights.',
        housing_offering: false,
        housing_seeking: false,
        verified: true,
        community_score: 4.9,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    setCurrentUser(mockCurrentUser)
    const topMatches = getTopMatches(mockCurrentUser, mockUsers, 5)
    setMatches(topMatches)
    setLoading(false)
  }, [])

  const handleStartChat = (matchId: string) => {
    // In a real app, this would create a conversation and redirect to chat
    console.log('Starting chat with:', matchId)
    // For demo, redirect to chat page
    window.location.href = `/chat/${matchId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your perfect matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              🌉 Bridge
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {currentUser?.name}</span>
              <Link href="/profile" className="text-indigo-600 hover:text-indigo-800">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Perfect Matches
          </h1>
          <p className="text-lg text-gray-600">
            We've found {matches.length} people who share your interests and goals
          </p>
        </div>

        {/* Matches Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <div key={match.user.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Match Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xl">
                        {match.user.role === 'mentor' ? '👵' : '👩‍🎓'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{match.user.name}</h3>
                      <p className="text-gray-600">{match.user.age} years old</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-yellow-500 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {match.user.community_score}
                      </span>
                    </div>
                    {match.user.verified && (
                      <div className="flex items-center text-green-600">
                        <Shield className="w-4 h-4" />
                        <span className="ml-1 text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compatibility Score */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Compatibility</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {Math.round(match.compatibility_score * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${match.compatibility_score * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Location and Communication */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {match.user.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {match.user.availability.communication_mode === 'both' ? 'Video & In-person' : 
                   match.user.availability.communication_mode === 'video' ? 'Video calls' : 'In-person'}
                </div>
              </div>

              {/* Match Details */}
              <div className="p-6">
                {/* Common Interests */}
                {match.breakdown.interests.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Shared Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.breakdown.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personality Match */}
                {match.breakdown.personality_match.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Personality Match</h4>
                    <ul className="text-sm text-gray-600">
                      {match.breakdown.personality_match.map((trait, idx) => (
                        <li key={idx} className="flex items-center mb-1">
                          <Heart className="w-3 h-3 text-pink-500 mr-2" />
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Motivation */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Connection Type</h4>
                  <p className="text-sm text-gray-600">{match.breakdown.motivation_alignment}</p>
                </div>

                {/* Housing Info */}
                {(match.user.housing_offering || match.user.housing_seeking) && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center text-green-700 text-sm font-medium">
                      <span className="mr-2">🏠</span>
                      {match.user.housing_offering ? 'Offers housing' : 'Looking for housing'}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleStartChat(match.user.id)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Conversation
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Matches State */}
        {matches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600 mb-6">
              Don't worry! We're constantly finding new people to connect with you.
            </p>
            <Link
              href="/profile"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Update Your Profile
            </Link>
          </div>
        )}

        {/* Refresh Matches */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.location.reload()}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Refresh Matches
          </button>
        </div>
      </main>
    </div>
  )
}
