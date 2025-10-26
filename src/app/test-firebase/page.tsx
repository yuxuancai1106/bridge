'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'

export default function TestFirebasePage() {
  const [status, setStatus] = useState<any>({})

  useEffect(() => {
    const testFirebase = async () => {
      const checks = {
        firebaseConfigured: false,
        authInitialized: false,
        apiKey: '',
        projectId: '',
        authDomain: '',
        error: null
      }

      try {
        // Check if Firebase is configured
        checks.firebaseConfigured = !!auth
        checks.authInitialized = !!auth?.app
        checks.apiKey = auth?.app?.options?.apiKey || 'NOT SET'
        checks.projectId = auth?.app?.options?.projectId || 'NOT SET'
        checks.authDomain = auth?.app?.options?.authDomain || 'NOT SET'
      } catch (error: any) {
        checks.error = error.message
      }

      setStatus(checks)
    }

    testFirebase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Firebase Configuration Test</h1>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {status.firebaseConfigured ? '✅' : '❌'}
            </span>
            <div>
              <div className="font-semibold">Firebase Configured</div>
              <div className="text-sm text-gray-600">
                {status.firebaseConfigured ? 'Firebase client is loaded' : 'Firebase not configured'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {status.authInitialized ? '✅' : '❌'}
            </span>
            <div>
              <div className="font-semibold">Auth Initialized</div>
              <div className="text-sm text-gray-600">
                {status.authInitialized ? 'Firebase Auth is ready' : 'Firebase Auth not initialized'}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h2 className="font-semibold mb-2">Configuration Details:</h2>
            <div className="bg-gray-50 p-4 rounded text-sm font-mono space-y-2">
              <div>
                <span className="text-gray-600">API Key:</span>{' '}
                <span className={status.apiKey === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                  {status.apiKey?.substring(0, 20)}...
                </span>
              </div>
              <div>
                <span className="text-gray-600">Project ID:</span>{' '}
                <span className={status.projectId === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                  {status.projectId}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Auth Domain:</span>{' '}
                <span className={status.authDomain === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                  {status.authDomain}
                </span>
              </div>
            </div>
          </div>

          {status.error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <div className="font-semibold text-red-800">Error:</div>
              <div className="text-red-600 text-sm">{status.error}</div>
            </div>
          )}

          <div className="border-t pt-4 mt-6">
            <h2 className="font-semibold mb-3">Next Steps:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Make sure you have enabled Authentication in Firebase Console</li>
              <li>Enable "Google" as a sign-in provider</li>
              <li>Add your support email in Google provider settings</li>
              <li>Make sure "localhost" is in Authorized domains</li>
              <li>Restart the dev server after making changes</li>
            </ol>
          </div>

          <div className="flex gap-3 mt-6">
            <a
              href="https://console.firebase.google.com/project/ask-gene-61b15/authentication/providers"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Open Firebase Console
            </a>
            <a
              href="/login"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
