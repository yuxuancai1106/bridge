'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Heart, MessageCircle, MapPin, Mail, Calendar,
  Trophy, LogOut, Edit, Sparkles, Star
} from 'lucide-react'
import { getUserProfile, signOut } from '@/lib/authService'
import { UserProfile } from '@/lib/authService'
import { useAuth } from '@/contexts/AuthContext'
import { findMatchesForUser } from '@/lib/dbService'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'matches'>('profile')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else {
        loadUserData()
      }
    }
  }, [user, authLoading, router])

  const loadUserData = async () => {
    if (!user) return

    try {
      // Get user profile
      const profile = await getUserProfile(user.uid)
      if (profile) {
        setUserProfile(profile)
      }

      // Get real matches from Firebase using the matching algorithm
      const realMatches = await findMatchesForUser(user.uid, 10)

      // Format matches for display
      const formattedMatches = realMatches.map(match => {
        const commonInterests = profile?.interests?.filter(i => match.interests?.includes(i)) || []
        const matchReasons = []

        if (commonInterests.length > 0) {
          matchReasons.push(`Shared interests: ${commonInterests.slice(0, 2).join(', ')}`)
        }
        if (match.matchScores.personalityScore > 7) {
          matchReasons.push('Compatible personalities')
        }
        if (match.location === profile?.location) {
          matchReasons.push('Located nearby')
        }
        if (match.role !== profile?.role) {
          matchReasons.push(`Perfect ${match.role === 'mentor' ? 'mentor' : 'mentee'} match`)
        }

        return {
          id: match.uid,
          name: match.name,
          age: match.age,
          role: match.role,
          location: match.location,
          interests: match.interests || [],
          compatibilityScore: match.matchScores.compatibilityScore,
          bio: match.bio || 'No bio provided yet.',
          matchReasons: matchReasons.length > 0 ? matchReasons : ['Good overall compatibility']
        }
      })

      setMatches(formattedMatches)
      setLoading(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
              <span className="text-gray-700">
                Welcome, <span className="font-semibold">{userProfile?.name || 'User'}</span>
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                My Profile
              </div>
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'matches'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                My Matches ({matches.length})
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'profile' ? (
          /* Profile Tab */
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{userProfile?.name}</h1>
                    <p className="text-lg text-gray-600 mt-1">
                      {userProfile?.role === 'mentor' ? '👵 Mentor' : '👩‍🎓 Seeker'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-gray-700 font-medium">
                        {userProfile?.communityScore?.toFixed(1) || '5.0'} Community Score
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>

              {/* Profile Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{matches.length}</div>
                  <div className="text-sm text-gray-600">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userProfile?.interests?.length || 0}</div>
                  <div className="text-sm text-gray-600">Interests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userProfile?.verified ? 'Yes' : 'Pending'}
                  </div>
                  <div className="text-sm text-gray-600">Verified</div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium">{userProfile?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div className="font-medium">{userProfile?.location || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Age</div>
                      <div className="font-medium">{userProfile?.age || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Pronouns</div>
                      <div className="font-medium">{userProfile?.pronouns || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {userProfile?.bio && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
                <p className="text-gray-700 leading-relaxed">{userProfile.bio}</p>
              </div>
            )}

            {/* Interests */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {userProfile?.interests && userProfile.interests.length > 0 ? (
                  userProfile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No interests added yet</p>
                )}
              </div>
            </div>

            {/* Personality Traits */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Personality Traits</h2>
              <div className="space-y-4">
                {[
                  { key: 'extrovert', label: 'Extroverted', icon: '🗣️' },
                  { key: 'patient', label: 'Patient', icon: '⏳' },
                  { key: 'humorous', label: 'Humorous', icon: '😄' },
                  { key: 'empathetic', label: 'Empathetic', icon: '❤️' }
                ].map((trait) => {
                  const value = userProfile?.personality?.[trait.key as keyof typeof userProfile.personality] || 5
                  return (
                    <div key={trait.key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {trait.icon} {trait.label}
                        </span>
                        <span className="text-sm text-gray-600">{value}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${(value / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Availability */}
            {userProfile?.availability && userProfile.availability.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Availability</h2>
                <div className="flex flex-wrap gap-2">
                  {userProfile.availability.map((time, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Matches Tab */
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Your Perfect Matches</h1>
                  <p className="text-gray-600 mt-1">
                    We found {matches.length} great connections for you!
                  </p>
                </div>
                <button
                  onClick={loadUserData}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Find More Matches
                </button>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
                  <p className="text-gray-600 mb-4">Complete your profile to find perfect matches!</p>
                  <Link
                    href="/profile/edit"
                    className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Complete Profile
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          {/* Avatar */}
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                            {match.name.charAt(0)}
                          </div>

                          {/* Match Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{match.name}</h3>
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                {match.role === 'mentor' ? '👵 Mentor' : '👩‍🎓 Seeker'}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {match.age} years old
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {match.location}
                              </span>
                            </div>

                            <p className="text-gray-700 mb-4">{match.bio}</p>

                            {/* Interests */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {match.interests.map((interest: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>

                            {/* Match Reasons */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <h4 className="text-sm font-semibold text-green-800 mb-2">
                                Why you're a great match:
                              </h4>
                              <ul className="space-y-1">
                                {match.matchReasons.map((reason: string, idx: number) => (
                                  <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Compatibility Score */}
                        <div className="text-center flex-shrink-0 ml-4">
                          <div className="w-24 h-24 rounded-full border-4 border-indigo-600 flex items-center justify-center mb-2">
                            <div>
                              <div className="text-2xl font-bold text-indigo-600">
                                {match.compatibilityScore}
                              </div>
                              <div className="text-xs text-gray-600">/ 10</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 font-medium">Match Score</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => router.push(`/chat/${match.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Start Conversation
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
