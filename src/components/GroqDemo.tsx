'use client'

import { useState } from 'react'

export default function GroqDemo() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [demoType, setDemoType] = useState<string>('')
  const [speechInput, setSpeechInput] = useState('')

  const runDemo = async (type: string) => {
    setLoading(true)
    setDemoType(type)
    setResults(null)

    try {
      let result = null

      switch (type) {
        case 'speech-correction':
          const correctionResponse = await fetch('/api/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fieldType: 'email',
              originalText: speechInput || 'david at gmail dot com'
            })
          })
          const correctionData = await correctionResponse.json()
          result = correctionData.success ? correctionData.data : { error: correctionData.error }
          break

        case 'matching':
          // For demo purposes, show a mock result for complex features
          result = {
            correctedText: 'Compatibility Score: 0.85\nStrong match based on shared interests in cooking and complementary personalities.',
            confidence: 0.85,
            processingTime: 150,
            model: 'Groq Fast',
            suggestions: ['Schedule video call', 'Start conversation']
          }
          break

        case 'conversation':
          result = {
            correctedText: 'Conversation Starters:\n1. "I see you both love cooking! What\'s your signature dish?"\n2. "Your gardening hobby sounds wonderful. Have you tried growing herbs?"\n3. "We have complementary interests. Let\'s chat about tech and life experiences!"',
            confidence: 0.9,
            processingTime: 120,
            model: 'Groq Quality'
          }
          break

        case 'safety':
          result = {
            correctedText: 'SAFE\nThis message appears genuine and safe. No red flags detected.',
            confidence: 0.95,
            processingTime: 100,
            model: 'Groq Fast',
            suggestions: ['Message is safe to send', 'Always meet in public first']
          }
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
        🚀 Groq Ultra-Fast AI Demo
      </h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">⚡ Why Groq?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Ultra-Fast TTFT:</strong> Time to First Token under 100ms</li>
          <li>• <strong>Real-time Processing:</strong> Perfect for speech-to-text applications</li>
          <li>• <strong>High Performance:</strong> Optimized for inference speed</li>
          <li>• <strong>Cost Effective:</strong> Fast and affordable API calls</li>
        </ul>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Speech Input (for speech correction demo):
        </label>
        <input
          type="text"
          value={speechInput}
          onChange={(e) => setSpeechInput(e.target.value)}
          placeholder="david at gmail dot com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => runDemo('speech-correction')}
          disabled={loading}
          className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-green-50 border-green-200"
        >
          <h3 className="font-semibold text-green-800">⚡ Speech Correction</h3>
          <p className="text-sm text-green-600">Ultra-fast text correction</p>
        </button>

        <button
          onClick={() => runDemo('matching')}
          disabled={loading}
          className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-blue-50 border-blue-200"
        >
          <h3 className="font-semibold text-blue-800">🎯 User Matching</h3>
          <p className="text-sm text-blue-600">Fast compatibility analysis</p>
        </button>

        <button
          onClick={() => runDemo('conversation')}
          disabled={loading}
          className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-purple-50 border-purple-200"
        >
          <h3 className="font-semibold text-purple-800">💬 Conversation Starters</h3>
          <p className="text-sm text-purple-600">Instant icebreaker generation</p>
        </button>

        <button
          onClick={() => runDemo('safety')}
          disabled={loading}
          className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-orange-50 border-orange-200"
        >
          <h3 className="font-semibold text-orange-800">🛡️ Safety Analysis</h3>
          <p className="text-sm text-orange-600">Real-time safety monitoring</p>
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Groq is processing at lightning speed...</p>
        </div>
      )}

      {results && !loading && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            ⚡ {demoType.charAt(0).toUpperCase() + demoType.slice(1)} Results
          </h2>
          
          {results.error ? (
            <div className="text-red-600">
              <p>❌ Error: {results.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.model && (
                <div>
                  <h3 className="font-semibold text-blue-700">🤖 Model Used:</h3>
                  <p className="text-sm">{results.model}</p>
                </div>
              )}

              {results.processingTime && (
                <div>
                  <h3 className="font-semibold text-green-700">⚡ Processing Time:</h3>
                  <p className="text-sm font-mono">
                    {results.processingTime}ms 
                    {results.processingTime < 100 && <span className="text-green-600 ml-2">🚀 Ultra-fast!</span>}
                    {results.processingTime < 200 && results.processingTime >= 100 && <span className="text-blue-600 ml-2">⚡ Very fast!</span>}
                  </p>
                </div>
              )}

              {results.confidence && (
                <div>
                  <h3 className="font-semibold text-purple-700">🎯 Confidence:</h3>
                  <p className="text-sm">{Math.round(results.confidence * 100)}%</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700">📝 Result:</h3>
                <p className="text-sm bg-white p-3 rounded border">
                  {results.correctedText}
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
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">🚀 Groq Performance Benefits:</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• <strong>Sub-100ms Response:</strong> Perfect for real-time applications</li>
          <li>• <strong>Speech-to-Text Ready:</strong> Optimized for voice interfaces</li>
          <li>• <strong>Cost Efficient:</strong> Fast processing = lower costs</li>
          <li>• <strong>Scalable:</strong> Handles high-volume requests</li>
          <li>• <strong>Reliable:</strong> Consistent performance</li>
        </ul>
      </div>
    </div>
  )
}
