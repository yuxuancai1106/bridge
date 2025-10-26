'use client'

import { useState } from 'react'
import { 
  intelligentUserMatching, 
  generateSmartConversationStarters, 
  analyzeMessageSafety,
  optimizeUserProfile,
  analyzeChatSentiment 
} from '@/lib/asiOneExamples'

export default function ASIOneDemo() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [demoType, setDemoType] = useState<string>('')

  const runDemo = async (type: string) => {
    setLoading(true)
    setDemoType(type)
    setResults(null)

    try {
      let result = null

      switch (type) {
        case 'matching':
          result = await intelligentUserMatching(
            {
              name: 'John Smith',
              age: 25,
              interests: ['technology', 'cooking', 'travel'],
              location: 'Berkeley, CA',
              personality: 'outgoing, creative'
            },
            {
              name: 'Sarah Johnson',
              age: 67,
              interests: ['gardening', 'cooking', 'reading'],
              location: 'Berkeley, CA',
              personality: 'patient, wise'
            }
          )
          break

        case 'conversation':
          result = await generateSmartConversationStarters(
            {
              name: 'John Smith',
              interests: ['technology', 'cooking'],
              role: 'seeker'
            },
            {
              name: 'Sarah Johnson',
              interests: ['gardening', 'cooking'],
              role: 'mentor'
            }
          )
          break

        case 'safety':
          result = await analyzeMessageSafety(
            'Hi! I\'d love to learn more about your gardening experience. Could we meet for coffee?',
            'user123',
            'user456'
          )
          break

        case 'profile':
          result = await optimizeUserProfile({
            name: 'John Smith',
            bio: 'I like tech stuff',
            interests: ['tech', 'food'],
            location: 'berkeley'
          })
          break

        case 'sentiment':
          result = await analyzeChatSentiment(
            'That sounds amazing! I\'m so excited to learn from you. Thank you for sharing your wisdom!',
            { context: 'mentor-mentee conversation' }
          )
          break

        default:
          result = { error: 'Unknown demo type' }
      }

      setResults(result)
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🤖 ASI:One Multi-Agent Demo
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => runDemo('matching')}
          disabled={loading}
          className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <h3 className="font-semibold">🎯 Intelligent Matching</h3>
          <p className="text-sm text-gray-600">Multi-agent compatibility analysis</p>
        </button>

        <button
          onClick={() => runDemo('conversation')}
          disabled={loading}
          className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <h3 className="font-semibold">💬 Smart Conversation Starters</h3>
          <p className="text-sm text-gray-600">AI-generated icebreakers</p>
        </button>

        <button
          onClick={() => runDemo('safety')}
          disabled={loading}
          className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <h3 className="font-semibold">🛡️ Safety Analysis</h3>
          <p className="text-sm text-gray-600">Real-time message safety check</p>
        </button>

        <button
          onClick={() => runDemo('profile')}
          disabled={loading}
          className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <h3 className="font-semibold">✨ Profile Optimization</h3>
          <p className="text-sm text-gray-600">AI-powered profile improvements</p>
        </button>

        <button
          onClick={() => runDemo('sentiment')}
          disabled={loading}
          className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <h3 className="font-semibold">😊 Sentiment Analysis</h3>
          <p className="text-sm text-gray-600">Emotional tone analysis</p>
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ASI:One is orchestrating agents...</p>
        </div>
      )}

      {results && !loading && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            🎯 {demoType.charAt(0).toUpperCase() + demoType.slice(1)} Results
          </h2>
          
          {results.error ? (
            <div className="text-red-600">
              <p>❌ Error: {results.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.agentsUsed && (
                <div>
                  <h3 className="font-semibold text-green-700">🤖 Agents Used:</h3>
                  <p className="text-sm">{results.agentsUsed.join(', ')}</p>
                </div>
              )}

              {results.compatibilityScore && (
                <div>
                  <h3 className="font-semibold text-blue-700">📊 Compatibility Score:</h3>
                  <p className="text-sm">{Math.round(results.compatibilityScore * 100)}%</p>
                </div>
              )}

              {results.safetyScore && (
                <div>
                  <h3 className="font-semibold text-orange-700">🛡️ Safety Score:</h3>
                  <p className="text-sm">{Math.round(results.safetyScore * 100)}%</p>
                </div>
              )}

              {results.confidence && (
                <div>
                  <h3 className="font-semibold text-purple-700">🎯 Confidence:</h3>
                  <p className="text-sm">{Math.round(results.confidence * 100)}%</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700">📝 Analysis:</h3>
                <p className="text-sm bg-white p-3 rounded border">
                  {results.analysis || results.result || results.starters || results.optimizedProfile || results.sentiment}
                </p>
              </div>

              {results.suggestions && results.suggestions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-700">💡 Suggestions:</h3>
                  <ul className="text-sm list-disc list-inside">
                    {results.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.nextActions && results.nextActions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-blue-700">🎯 Next Actions:</h3>
                  <ul className="text-sm list-disc list-inside">
                    {results.nextActions.map((action: string, index: number) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">🚀 What ASI:One Can Do:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Agent Orchestration:</strong> Calls multiple specialized agents</li>
          <li>• <strong>Contextual Memory:</strong> Remembers conversation history</li>
          <li>• <strong>Multi-Step Reasoning:</strong> Breaks down complex tasks</li>
          <li>• <strong>Real-time Analysis:</strong> Processes data instantly</li>
          <li>• <strong>Personalized Responses:</strong> Adapts to user preferences</li>
          <li>• <strong>Safety Monitoring:</strong> Ensures secure interactions</li>
          <li>• <strong>Profile Optimization:</strong> Enhances user profiles</li>
          <li>• <strong>Sentiment Analysis:</strong> Understands emotional context</li>
        </ul>
      </div>
    </div>
  )
}
