'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Shield, Heart, MessageCircle } from 'lucide-react'
import { CONVERSATION_STARTERS, SAFETY_TIPS } from '@/lib/utils'
import TTSControls from '@/components/TTSControls'
import TTSButton from '@/components/TTSButton'
import { useTTS } from '@/hooks/useTTS'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: 'text' | 'image' | 'system'
  created_at: string
  read_at?: string
}

interface ChatUser {
  id: string
  name: string
  age: number
  role: 'mentor' | 'seeker'
  verified: boolean
  community_score: number
}

export default function ChatPage() {
  const params = useParams()
  const chatId = params.id as string
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatUser, setChatUser] = useState<ChatUser | null>(null)
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSafetyTips, setShowSafetyTips] = useState(true)
  const { speak, isEnabled } = useTTS()

  const speakMessage = (message: Message, senderName: string) => {
    if (isEnabled) {
      speak(`${senderName} says: ${message.content}`)
    }
  }

  const speakConversationStarter = (starter: string) => {
    if (isEnabled) {
      speak(`Conversation starter: ${starter}`)
    }
  }

  const speakSafetyTip = (tip: string) => {
    if (isEnabled) {
      speak(`Safety tip: ${tip}`)
    }
  }

  useEffect(() => {
    // Mock data for demo
    const mockChatUser: ChatUser = {
      id: chatId,
      name: chatId === '22222222-2222-2222-2222-222222222222' ? 'Alex Chen' : 'Sarah Williams',
      age: chatId === '22222222-2222-2222-2222-222222222222' ? 22 : 21,
      role: 'seeker',
      verified: true,
      community_score: 4.5
    }

    const mockCurrentUser: ChatUser = {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Mary Johnson',
      age: 67,
      role: 'mentor',
      verified: true,
      community_score: 4.8
    }

    const mockMessages: Message[] = [
      {
        id: '1',
        sender_id: 'system',
        receiver_id: 'both',
        content: 'You two have been matched! You share interests in cooking and volunteering.',
        message_type: 'system',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        sender_id: mockCurrentUser.id,
        receiver_id: mockChatUser.id,
        content: 'Hello! I\'m excited to connect with you. I saw we both enjoy cooking - what\'s your favorite dish to make?',
        message_type: 'text',
        created_at: new Date(Date.now() - 3000000).toISOString()
      },
      {
        id: '3',
        sender_id: mockChatUser.id,
        receiver_id: mockCurrentUser.id,
        content: 'Hi Mary! Nice to meet you! I love making homemade pasta and experimenting with different sauces. What about you?',
        message_type: 'text',
        created_at: new Date(Date.now() - 2400000).toISOString()
      },
      {
        id: '4',
        sender_id: mockCurrentUser.id,
        receiver_id: mockChatUser.id,
        content: 'That sounds wonderful! I\'ve been cooking for over 40 years and I love sharing family recipes. Would you be interested in learning some traditional techniques?',
        message_type: 'text',
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ]

    setChatUser(mockChatUser)
    setCurrentUser(mockCurrentUser)
    setMessages(mockMessages)
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser || !chatUser) return

    const message: Message = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      receiver_id: chatUser.id,
      content: newMessage.trim(),
      message_type: 'text',
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const sendConversationStarter = (starter: string) => {
    if (!currentUser || !chatUser) return

    const message: Message = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      receiver_id: chatUser.id,
      content: starter,
      message_type: 'text',
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, message])
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/matches" className="mr-4 text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg">
                    {chatUser?.role === 'mentor' ? '👵' : '👩‍🎓'}
                  </span>
                </div>
                <div>
                  <h1 className="font-semibold text-lg">{chatUser?.name}</h1>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>{chatUser?.age} years old</span>
                    {chatUser?.verified && (
                      <>
                        <span className="mx-2">•</span>
                        <Shield className="w-4 h-4 text-green-600 mr-1" />
                        <span>Verified</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TTSControls compact={true} showSettings={false} />
              <Heart className="w-4 h-4 text-yellow-500 mr-1" />
              <span>{chatUser?.community_score}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto flex h-[calc(100vh-80px)]">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {/* Safety Banner */}
          {showSafetyTips && (
            <div className="bg-yellow-50 border-b border-yellow-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-1">Safety First</h3>
                    <p className="text-sm text-yellow-700">
                      Always meet in public for your first meeting. Never share financial information.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSafetyTips(false)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.message_type === 'system'
                      ? 'bg-blue-50 text-blue-800 text-center mx-auto'
                      : message.sender_id === currentUser?.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm flex-1">{message.content}</p>
                    {message.message_type !== 'system' && isEnabled && (
                      <TTSButton 
                        text={`${message.sender_id === currentUser?.id ? 'You' : chatUser?.name} says: ${message.content}`}
                        className="ml-2 text-xs"
                        onClick={() => speakMessage(message, message.sender_id === currentUser?.id ? 'You' : chatUser?.name || 'Unknown')}
                      >
                        🔊
                      </TTSButton>
                    )}
                  </div>
                  {message.message_type !== 'system' && (
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(message.created_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t bg-white p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l p-4 overflow-y-auto">
          {/* Conversation Starters */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Conversation Starters
            </h3>
            <div className="space-y-2">
              {CONVERSATION_STARTERS.slice(0, 4).map((starter, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    onClick={() => sendConversationStarter(starter)}
                    className="flex-1 text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {starter}
                  </button>
                  <TTSButton 
                    text={`Conversation starter: ${starter}`}
                    className="text-xs"
                    onClick={() => speakConversationStarter(starter)}
                  >
                    🔊
                  </TTSButton>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Tips */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Safety Tips
            </h3>
            <div className="space-y-2">
              {SAFETY_TIPS.map((tip, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="text-sm text-gray-600 p-2 bg-yellow-50 rounded flex-1">
                    {tip}
                  </div>
                  <TTSButton 
                    text={`Safety tip: ${tip}`}
                    className="text-xs"
                    onClick={() => speakSafetyTip(tip)}
                  >
                    🔊
                  </TTSButton>
                </div>
              ))}
            </div>
          </div>

          {/* Match Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Match Details</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Compatibility:</span>
                <span className="font-medium text-indigo-600">87%</span>
              </div>
              <div className="flex justify-between">
                <span>Shared Interests:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span>Communication:</span>
                <span className="font-medium">Both</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Schedule Meeting
            </button>
            <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors">
              Report User
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
