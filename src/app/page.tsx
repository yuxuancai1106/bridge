'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Users, Shield, MessageCircle } from 'lucide-react'
import TTSControls from '@/components/TTSControls'
import TTSButton from '@/components/TTSButton'
import { useTTS } from '@/hooks/useTTS'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { speak } = useTTS()
  const { user, loading } = useAuth()
  const router = useRouter()

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleReadHero = () => {
    speak("Bridge Generations, One Conversation at a Time. Connect with wisdom, share experiences, and build meaningful relationships across generations. Whether you're seeking mentorship or want to share your knowledge, Bridge brings people together.")
  }

  const handleReadFeatures = () => {
    speak("Bridge offers meaningful connections through smart matching, real-time chat with safety features, and comprehensive verification to keep everyone safe.")
  }

  const handleReadHowItWorks = () => {
    speak("How Bridge works: First, create your profile by sharing your interests, goals, and what you're looking for. Second, get matched with compatible people in your area using our AI algorithm. Third, start chatting with conversation starters and safety tips. Fourth, meet and connect to build lasting relationships and learn from each other.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-indigo-600">🌉 Bridge</div>
            </div>
            <div className="flex items-center gap-4">
              <TTSControls compact={true} showSettings={false} />
              <nav className="hidden md:flex space-x-8">
                <Link href="/about" className="text-gray-600 hover:text-indigo-600">
                  About
                </Link>
                <Link href="/safety" className="text-gray-600 hover:text-indigo-600">
                  Safety
                </Link>
                {user ? (
                  <Link href="/dashboard" className="text-indigo-600 font-semibold hover:text-indigo-700">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/login" className="text-gray-600 hover:text-indigo-600">
                    Sign In
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Bridge Generations,
              <br />
              <span className="text-indigo-600">One Conversation at a Time</span>
            </h1>
            <TTSButton 
              text="Bridge Generations, One Conversation at a Time. Connect with wisdom, share experiences, and build meaningful relationships across generations."
              className="text-lg"
            >
              🔊 Read Title
            </TTSButton>
          </div>
          <div className="flex flex-col items-center gap-4 mb-8">
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with wisdom, share experiences, and build meaningful relationships across generations. 
              Whether you're seeking mentorship or want to share your knowledge, Bridge brings people together.
            </p>
            <TTSButton 
              text="Connect with wisdom, share experiences, and build meaningful relationships across generations. Whether you're seeking mentorship or want to share your knowledge, Bridge brings people together."
            >
              🔊 Read Description
            </TTSButton>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup?role=mentor"
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  👵 I'm a Mentor
                </Link>
                <Link
                  href="/signup?role=seeker"
                  className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors"
                >
                  👩‍🎓 I'm a Student
                </Link>
              </>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Meaningful Connections</h3>
              <p className="text-gray-600 mb-4">
                Build genuine relationships based on shared interests and mutual respect.
              </p>
              <TTSButton 
                text="Meaningful Connections. Build genuine relationships based on shared interests and mutual respect."
                className="w-full"
              >
                🔊 Read Feature
              </TTSButton>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600 mb-4">
                Our algorithm finds compatible matches based on interests, personality, and goals.
              </p>
              <TTSButton 
                text="Smart Matching. Our algorithm finds compatible matches based on interests, personality, and goals."
                className="w-full"
              >
                🔊 Read Feature
              </TTSButton>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600 mb-4">
                Verified profiles, safety guidelines, and community moderation keep everyone safe.
              </p>
              <TTSButton 
                text="Safe and Secure. Verified profiles, safety guidelines, and community moderation keep everyone safe."
                className="w-full"
              >
                🔊 Read Feature
              </TTSButton>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-16">
            <div className="flex flex-col items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold">How Bridge Works</h2>
              <TTSButton 
                text="How Bridge works: First, create your profile by sharing your interests, goals, and what you're looking for. Second, get matched with compatible people in your area using our AI algorithm. Third, start chatting with conversation starters and safety tips. Fourth, meet and connect to build lasting relationships and learn from each other."
                className="text-lg"
              >
                🔊 Read How It Works
              </TTSButton>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">Create Profile</h3>
                <p className="text-sm text-gray-600 mb-3">Share your interests, goals, and what you're looking for</p>
                <TTSButton 
                  text="Step 1: Create Profile. Share your interests, goals, and what you're looking for."
                  className="text-xs"
                >
                  🔊 Read Step 1
                </TTSButton>
              </div>
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">Get Matched</h3>
                <p className="text-sm text-gray-600 mb-3">Our algorithm finds compatible people in your area</p>
                <TTSButton 
                  text="Step 2: Get Matched. Our algorithm finds compatible people in your area."
                  className="text-xs"
                >
                  🔊 Read Step 2
                </TTSButton>
              </div>
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">Start Chatting</h3>
                <p className="text-sm text-gray-600 mb-3">Break the ice with conversation starters and safety tips</p>
                <TTSButton 
                  text="Step 3: Start Chatting. Break the ice with conversation starters and safety tips."
                  className="text-xs"
                >
                  🔊 Read Step 3
                </TTSButton>
              </div>
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">4</span>
                </div>
                <h3 className="font-semibold mb-2">Meet & Connect</h3>
                <p className="text-sm text-gray-600 mb-3">Build lasting relationships and learn from each other</p>
                <TTSButton 
                  text="Step 4: Meet and Connect. Build lasting relationships and learn from each other."
                  className="text-xs"
                >
                  🔊 Read Step 4
                </TTSButton>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-indigo-600 text-white rounded-lg p-8 mb-16">
            <div className="flex flex-col items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold">Building Bridges, One Connection at a Time</h2>
              <TTSButton 
                text="Building Bridges, One Connection at a Time. We have over 500 active users, 1200 successful matches, and 5000 hours of meaningful connections."
                className="text-lg bg-white text-indigo-600 hover:bg-indigo-50"
              >
                🔊 Read Stats
              </TTSButton>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-indigo-200">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">1,200+</div>
                <div className="text-indigo-200">Successful Matches</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5,000+</div>
                <div className="text-indigo-200">Hours of Connection</div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold">Ready to Bridge the Gap?</h2>
              <TTSButton
                text="Ready to Bridge the Gap? Join thousands of people building meaningful connections across generations."
                className="text-lg"
              >
                🔊 Read Call to Action
              </TTSButton>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of people building meaningful connections across generations.
            </p>
            {user ? (
              <Link
                href="/dashboard"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
              >
                Get Started Today
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">🌉 Bridge</div>
            <p className="text-gray-400 mb-4">
              Connecting generations through meaningful relationships
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white">
                Contact Us
              </Link>
            </div>
            <p className="text-gray-500 mt-4">
              © 2024 Bridge. Built for CalHacks 2024.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}