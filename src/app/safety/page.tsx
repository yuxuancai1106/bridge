import Link from 'next/link'
import { Shield, CheckCircle, AlertTriangle, Users, Phone, MapPin, Lock } from 'lucide-react'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              🌉 Bridge
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/about" className="text-gray-600 hover:text-indigo-600">
                About
              </Link>
              <Link href="/safety" className="text-indigo-600 font-medium">
                Safety
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-indigo-600">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Safety First
          </h1>
          <p className="text-xl text-gray-600">
            Your safety and security are our top priorities. Here's how we protect our community.
          </p>
        </div>

        {/* Safety Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <CheckCircle className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Verified Profiles</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Educational email verification for students</li>
              <li>• ID verification for mentors</li>
              <li>• Community rating system</li>
              <li>• Background check partnerships</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Community Moderation</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• 24/7 content monitoring</li>
              <li>• AI-powered message filtering</li>
              <li>• User reporting system</li>
              <li>• Community guidelines enforcement</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Lock className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Privacy Protection</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• End-to-end encrypted messaging</li>
              <li>• Secure data storage</li>
              <li>• Privacy controls</li>
              <li>• GDPR compliance</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <AlertTriangle className="w-8 h-8 text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Safety Resources</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Safety guidelines and tips</li>
              <li>• Emergency contact information</li>
              <li>• Support team availability</li>
              <li>• Educational resources</li>
            </ul>
          </div>
        </div>

        {/* Safety Guidelines */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Safety Guidelines</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Meeting Safely
              </h3>
              <ul className="space-y-2 text-gray-600 ml-7">
                <li>• Always meet in public places for your first meeting</li>
                <li>• Tell a friend or family member where you're going</li>
                <li>• Trust your instincts - if something feels wrong, leave</li>
                <li>• Don't share your home address until you build trust</li>
                <li>• Consider bringing a friend for the first meeting</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-600" />
                Communication Safety
              </h3>
              <ul className="space-y-2 text-gray-600 ml-7">
                <li>• Never share financial information</li>
                <li>• Don't send money or accept money transfers</li>
                <li>• Be cautious about sharing personal details</li>
                <li>• Report any suspicious behavior immediately</li>
                <li>• Use the platform's messaging system initially</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                Trust Your Instincts
              </h3>
              <ul className="space-y-2 text-gray-600 ml-7">
                <li>• If someone seems too good to be true, they might be</li>
                <li>• Watch for red flags in conversations</li>
                <li>• Don't feel pressured to meet or share information</li>
                <li>• Report users who violate our community guidelines</li>
                <li>• Remember: you can always block or report someone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Red Flags */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-red-800">Red Flags to Watch For</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-700">Financial Red Flags</h3>
              <ul className="space-y-2 text-red-600">
                <li>• Asking for money or financial help</li>
                <li>• Offering money or expensive gifts</li>
                <li>• Requesting bank account information</li>
                <li>• Suggesting investment opportunities</li>
                <li>• Asking for gift cards or wire transfers</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-700">Behavioral Red Flags</h3>
              <ul className="space-y-2 text-red-600">
                <li>• Pressuring you to meet immediately</li>
                <li>• Avoiding video calls or in-person meetings</li>
                <li>• Inconsistent stories or information</li>
                <li>• Asking for inappropriate photos</li>
                <li>• Being overly aggressive or pushy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Emergency Resources */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Emergency Resources</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚨</span>
              </div>
              <h3 className="font-semibold mb-2">Emergency</h3>
              <p className="text-sm text-gray-600 mb-3">If you're in immediate danger</p>
              <a href="tel:911" className="text-red-600 font-medium">Call 911</a>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="font-semibold mb-2">Bridge Support</h3>
              <p className="text-sm text-gray-600 mb-3">Report safety concerns</p>
              <a href="mailto:safety@bridge.com" className="text-blue-600 font-medium">safety@bridge.com</a>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🆘</span>
              </div>
              <h3 className="font-semibold mb-2">Crisis Hotline</h3>
              <p className="text-sm text-gray-600 mb-3">24/7 mental health support</p>
              <a href="tel:988" className="text-green-600 font-medium">Call 988</a>
            </div>
          </div>
        </div>

        {/* Report Button */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            If you encounter any safety concerns or need assistance, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/report"
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Report a Safety Issue
            </Link>
            <Link
              href="/contact"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Contact Support
            </Link>
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
