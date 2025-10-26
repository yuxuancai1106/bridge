'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, MessageCircle, Heart, TrendingUp, Clock, Award, Target } from 'lucide-react'

interface DashboardStats {
  totalConnections: number
  totalMessages: number
  totalHours: number
  communityScore: number
  matchesThisWeek: number
  conversationsActive: number
  impactScore: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalConnections: 0,
    totalMessages: 0,
    totalHours: 0,
    communityScore: 0,
    matchesThisWeek: 0,
    conversationsActive: 0,
    impactScore: 0
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demo
    const mockStats: DashboardStats = {
      totalConnections: 12,
      totalMessages: 247,
      totalHours: 18.5,
      communityScore: 4.8,
      matchesThisWeek: 3,
      conversationsActive: 4,
      impactScore: 87
    }

    // Simulate loading
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [])

  const achievements = [
    {
      id: 1,
      title: 'First Connection',
      description: 'Made your first meaningful connection',
      icon: '🎉',
      earned: true,
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Mentor Master',
      description: 'Helped 5+ students with career advice',
      icon: '👨‍🏫',
      earned: true,
      date: '2024-01-20'
    },
    {
      id: 3,
      title: 'Community Builder',
      description: 'Active for 30+ days',
      icon: '🏗️',
      earned: true,
      date: '2024-02-01'
    },
    {
      id: 4,
      title: 'Wisdom Keeper',
      description: 'Share 100+ hours of knowledge',
      icon: '📚',
      earned: false,
      progress: 65
    },
    {
      id: 5,
      title: 'Bridge Champion',
      description: 'Connect 25+ people across generations',
      icon: '🌉',
      earned: false,
      progress: 48
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'connection',
      message: 'Connected with Alex Chen',
      time: '2 hours ago',
      icon: '🤝'
    },
    {
      id: 2,
      type: 'message',
      message: 'Received message from Sarah Williams',
      time: '4 hours ago',
      icon: '💬'
    },
    {
      id: 3,
      type: 'achievement',
      message: 'Earned "Mentor Master" badge',
      time: '1 day ago',
      icon: '🏆'
    },
    {
      id: 4,
      type: 'match',
      message: 'New match: David Rodriguez',
      time: '2 days ago',
      icon: '💕'
    }
  ]

  if (loading) {
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
              <Link href="/matches" className="text-gray-600 hover:text-indigo-600">
                Matches
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-indigo-600">
                Profile
              </Link>
              <span className="text-gray-600">Welcome, Mary!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Impact Dashboard</h1>
          <p className="text-lg text-gray-600">
            See how you're making a difference in connecting generations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Connections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConnections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Messages Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Hours Connected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-pink-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Community Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.communityScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Score */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Impact Score</h2>
              <p className="text-indigo-100 mb-4">
                You've made a significant positive impact on {stats.totalConnections} people's lives
              </p>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="text-sm">+12% this month</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold">{stats.impactScore}</div>
              <div className="text-indigo-200">Impact Points</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Achievements
            </h3>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.earned
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{achievement.icon}</span>
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.earned && (
                          <p className="text-xs text-green-600 mt-1">
                            Earned on {achievement.date}
                          </p>
                        )}
                      </div>
                    </div>
                    {!achievement.earned && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600">
                          {achievement.progress}%
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                  <span className="text-2xl mr-4">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{activity.message}</p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-xl font-bold mb-6">This Week's Goals</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Send 10 Messages</h4>
              <div className="text-sm text-gray-600 mb-2">7 / 10 completed</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Make 2 New Connections</h4>
              <div className="text-sm text-gray-600 mb-2">1 / 2 completed</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Spend 5 Hours Connecting</h4>
              <div className="text-sm text-gray-600 mb-2">3.5 / 5 hours</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Link
            href="/matches"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            Find More Connections
          </Link>
        </div>
      </main>
    </div>
  )
}
