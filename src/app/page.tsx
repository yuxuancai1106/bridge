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
          {/* Hero Badge */}
          <div className="inline-block mb-6 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
            🚀 Powered by Groq AI • Ultra-Fast Speech Recognition
          </div>
          
          <div className="flex flex-col items-center gap-4 mb-8">
            <h1 className="text-4xl md:text-7xl font-bold text-gray-900 leading-tight animate-fade-in">
              Bridge Generations,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                One Conversation at a Time
              </span>
            </h1>
            <TTSButton 
              text="Bridge Generations, One Conversation at a Time. Connect with wisdom, share experiences, and build meaningful relationships across generations."
              className="text-lg hover:scale-105 transition-transform"
            >
              🔊 Read Title
            </TTSButton>
          </div>
          
          <div className="flex flex-col items-center gap-6 mb-12">
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with wisdom, share experiences, and build meaningful relationships across generations. 
              Whether you're seeking mentorship or want to share your knowledge, <strong className="text-indigo-600">Bridge brings people together</strong>.
            </p>
            <TTSButton 
              text="Connect with wisdom, share experiences, and build meaningful relationships across generations. Whether you're seeking mentorship or want to share your knowledge, Bridge brings people together."
              className="hover:scale-105 transition-transform"
            >
              🔊 Read Description
            </TTSButton>
          </div>
          
          {/* CTA Buttons with Enhanced Design */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {user ? (
              <Link
                href="/dashboard"
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  Go to Dashboard
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            ) : (
              <>
                <Link 
                  href="/signup?role=mentor"
                  className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    👵 I'm a Mentor
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
                <Link 
                  href="/signup?role=seeker"
                  className="group bg-white text-indigo-600 border-3 border-indigo-600 px-10 py-5 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    👩‍🎓 I'm a Student
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
              </>
            )}
          </div>
          
          {/* Video Demo Link */}
          <div className="mb-20">
            <Link 
              href="/groq-demo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg"
            >
              <span>🚀</span>
              <span className="font-semibold">Try Groq AI Demo</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">New</span>
            </Link>
          </div>

          {/* Features Grid with Enhanced Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-transparent hover:border-indigo-200">
              <div className="bg-gradient-to-br from-pink-100 to-rose-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Meaningful Connections</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Build genuine relationships based on shared interests and mutual respect.
              </p>
              <TTSButton 
                text="Meaningful Connections. Build genuine relationships based on shared interests and mutual respect."
                className="w-full"
              >
                🔊 Read Feature
              </TTSButton>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-transparent hover:border-indigo-200">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">AI-Powered</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Ultra-fast speech-to-text with Groq AI. Perfect for seniors who prefer voice input.
              </p>
              <TTSButton 
                text="AI Powered. Ultra-fast speech-to-text with Groq AI. Perfect for seniors who prefer voice input."
                className="w-full"
              >
                🔊 Read Feature
              </TTSButton>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-transparent hover:border-indigo-200">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Safe & Secure</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
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