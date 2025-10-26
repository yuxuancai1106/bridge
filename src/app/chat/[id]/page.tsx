'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Mic, MicOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile } from '@/lib/authService'
import { UserProfile } from '@/lib/authService'
import {
  getConversation,
  getMessages,
  createMessage,
  createConversation,
  Message,
} from '@/lib/dbService'

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const recordedTextRef = useRef<string>('')

  const otherUserId = params.id as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      initializeChat()
    }
  }, [user, authLoading])

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          recordedTextRef.current += finalTranscript
        }

        // Update the message input with current transcript
        setNewMessage(recordedTextRef.current + interimTranscript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart if still recording
          recognitionRef.current.start()
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    if (!user) return

    try {
      // Get other user's profile
      const profile = await getUserProfile(otherUserId)
      if (profile) {
        setOtherUser(profile)
      }

      // Check if conversation exists or create new one
      const participants = [user.uid, otherUserId].sort()
      let convId = await createConversation(participants)
      setConversationId(convId)

      // Load messages
      const msgs = await getMessages(convId)
      setMessages(msgs.reverse())

      setLoading(false)
    } catch (error) {
      console.error('Error initializing chat:', error)
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    recordedTextRef.current = ''

    try {
      const currentUserProfile = await getUserProfile(user.uid)

      const messageData: Message = {
        conversationId,
        senderId: user.uid,
        senderName: currentUserProfile?.name || 'Unknown',
        content: messageContent,
        safetyChecked: false,
      }

      await createMessage(messageData)

      // Add message to local state
      setMessages(prev => [
        ...prev,
        { ...messageData, timestamp: new Date() },
      ])
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current.stop()
      setIsRecording(false)
      // The recorded text is already in newMessage, ready to send
    } else {
      // Start recording
      recordedTextRef.current = newMessage // Keep existing text
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-lg font-bold">
                  {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {otherUser?.name || 'User'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {otherUser?.role === 'mentor' ? '👵 Mentor' : '👩‍🎓 Seeker'}
                  </p>
                </div>
              </div>
            </div>
            <Link href="/" className="text-xl font-bold text-indigo-600">
              🌉 Bridge
            </Link>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.senderId === user?.uid
              return (
                <div
                  key={index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      isOwnMessage
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900 shadow-md'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">{message.senderName}</p>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end gap-2">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRecording ? 'Listening...' : 'Type a message...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              {isRecording && (
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-500 font-medium">Recording</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isProcessing}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          {isRecording && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Click the microphone again to stop recording and send
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
