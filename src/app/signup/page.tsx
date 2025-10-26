'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { INTEREST_CATEGORIES, PERSONALITY_TRAITS, AVAILABILITY_TIMES, COMMUNICATION_MODES } from '@/lib/utils'
import TTSControls from '@/components/TTSControls'
import TTSButton from '@/components/TTSButton'
import SpeechInput from '@/components/SpeechInput'
import SpeechTextarea from '@/components/SpeechTextarea'
import { useTTS } from '@/hooks/useTTS'

interface FormData {
  // Basic Info
  name: string
  email: string
  age: number
  location: string
  pronouns: string
  role: 'mentor' | 'seeker'
  
  // Interests
  interests: string[]
  
  // Personality
  personality: {
    extrovert: boolean
    patient: boolean
    humorous: boolean
    empathetic: boolean
  }
  
  // Availability
  availability: {
    preferred_times: string[]
    communication_mode: 'video' | 'in-person' | 'both'
  }
  
  // Motivation
  motivation: string
  
  // Housing (optional)
  housing_offering: boolean
  housing_seeking: boolean
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { speak } = useTTS()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    age: 0,
    location: '',
    pronouns: '',
    role: searchParams.get('role') as 'mentor' | 'seeker' || 'mentor',
    interests: [],
    personality: {
      extrovert: false,
      patient: false,
      humorous: false,
      empathetic: false
    },
    availability: {
      preferred_times: [],
      communication_mode: 'both'
    },
    motivation: '',
    housing_offering: false,
    housing_seeking: false
  })

  // TTS helper functions
  const speakStepInstructions = (step: number) => {
    const instructions = {
      1: "Step 1: Basic Information. Please provide your name, email address, age, location, and pronouns. This information helps us create your profile and find compatible matches.",
      2: "Step 2: Role and Motivation. Choose whether you're a mentor who wants to share knowledge, or a seeker who wants to learn. Tell us what motivates you to connect with others.",
      3: "Step 3: Interests and Personality. Select your interests and personality traits. This helps us match you with people who share similar passions and complementary personalities.",
      4: "Step 4: Availability and Communication. Choose your preferred meeting times and communication methods. This ensures we match you with people who are available when you are.",
      5: "Step 5: Safety and Verification. Review our safety guidelines and agree to our terms. Your safety is our top priority."
    }
    speak(instructions[step as keyof typeof instructions] || "Please complete this step.")
  }

  const speakFieldLabel = (label: string, placeholder?: string) => {
    const text = placeholder ? `${label}. ${placeholder}` : label
    speak(text)
  }

  const totalSteps = 6

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData)
      
      // For demo purposes, redirect to matches page
      router.push('/matches')
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-center">Let's Get Started!</h2>
              <TTSButton 
                text="Let's Get Started! Please provide your basic information to create your profile."
                className="text-lg"
              >
                🔊 Read Instructions
              </TTSButton>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    What's your name? *
                  </label>
                  <TTSButton 
                    text="What's your name? Enter your full name."
                    className="text-xs"
                  >
                    🔊
                  </TTSButton>
                </div>
                <SpeechInput
                  value={formData.name}
                  onChange={(value) => updateFormData({ name: value })}
                  placeholder="Enter your full name"
                  className="w-full"
                  fieldType="name"
                  enableLLMCorrection={true}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email address *
                  </label>
                  <TTSButton 
                    text="Email address. Enter your email address."
                    className="text-xs"
                  >
                    🔊
                  </TTSButton>
                </div>
                <SpeechInput
                  value={formData.email}
                  onChange={(value) => updateFormData({ email: value })}
                  placeholder="your@email.com"
                  className="w-full"
                  fieldType="email"
                  enableLLMCorrection={true}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Age *
                  </label>
                  <TTSButton 
                    text="Age. Enter your age."
                    className="text-xs"
                  >
                    🔊
                  </TTSButton>
                </div>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => updateFormData({ age: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your age"
                  min="18"
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Location (City, State) *
                  </label>
                  <TTSButton 
                    text="Location. Enter your city and state."
                    className="text-xs"
                  >
                    🔊
                  </TTSButton>
                </div>
                <SpeechInput
                  value={formData.location}
                  onChange={(value) => updateFormData({ location: value })}
                  placeholder="e.g., Berkeley, CA"
                  className="w-full"
                  fieldType="location"
                  enableLLMCorrection={true}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pronouns
                  </label>
                  <TTSButton 
                    text="Pronouns. Select your preferred pronouns."
                    className="text-xs"
                  >
                    🔊
                  </TTSButton>
                </div>
                <select
                  value={formData.pronouns}
                  onChange={(e) => updateFormData({ pronouns: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select pronouns</option>
                  <option value="she/her">She/Her</option>
                  <option value="he/him">He/Him</option>
                  <option value="they/them">They/Them</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-center">What are your interests?</h2>
              <TTSButton 
                text="What are your interests? Select topics you enjoy talking about. This helps us find compatible matches."
                className="text-lg"
              >
                🔊 Read Instructions
              </TTSButton>
            </div>
            <p className="text-gray-600 text-center mb-6">
              Select topics you enjoy talking about. This helps us find compatible matches.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INTEREST_CATEGORIES.map((interest) => (
                <button
                  key={interest}
                  onClick={() => {
                    const newInterests = formData.interests.includes(interest)
                      ? formData.interests.filter(i => i !== interest)
                      : [...formData.interests, interest]
                    updateFormData({ interests: newInterests })
                  }}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    formData.interests.includes(interest)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-center">Tell us about your personality</h2>
              <TTSButton 
                text="Tell us about your personality. Help us understand how you interact with others by selecting traits that describe you."
                className="text-lg"
              >
                🔊 Read Instructions
              </TTSButton>
            </div>
            <p className="text-gray-600 text-center mb-6">
              Help us understand how you interact with others.
            </p>
            
            <div className="space-y-4">
              {PERSONALITY_TRAITS.map((trait) => (
                <div key={trait.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{trait.label}</div>
                    <div className="text-sm text-gray-600">{trait.description}</div>
                    <TTSButton 
                      text={`${trait.label}. ${trait.description}`}
                      className="text-xs mt-2"
                    >
                      🔊 Read Trait
                    </TTSButton>
                  </div>
                  <button
                    onClick={() => {
                      updateFormData({
                        personality: {
                          ...formData.personality,
                          [trait.key]: !formData.personality[trait.key as keyof typeof formData.personality]
                        }
                      })
                    }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.personality[trait.key as keyof typeof formData.personality]
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {formData.personality[trait.key as keyof typeof formData.personality] && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">When are you available?</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred meeting times
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABILITY_TIMES.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        const newTimes = formData.availability.preferred_times.includes(time)
                          ? formData.availability.preferred_times.filter(t => t !== time)
                          : [...formData.availability.preferred_times, time]
                        updateFormData({
                          availability: {
                            ...formData.availability,
                            preferred_times: newTimes
                          }
                        })
                      }}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        formData.availability.preferred_times.includes(time)
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Communication preference
                </label>
                <div className="space-y-3">
                  {COMMUNICATION_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => {
                        updateFormData({
                          availability: {
                            ...formData.availability,
                            communication_mode: mode.value as any
                          }
                        })
                      }}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                        formData.availability.communication_mode === mode.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{mode.icon}</span>
                        <span className="font-medium">{mode.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-center">What motivates you?</h2>
              <TTSButton 
                text="What motivates you? Help us understand what you're looking for in a connection by telling us about your goals."
                className="text-lg"
              >
                🔊 Read Instructions
              </TTSButton>
            </div>
            <p className="text-gray-600 text-center mb-6">
              Help us understand what you're looking for in a connection.
            </p>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tell us about your goals and what you hope to gain from Bridge
                </label>
                <TTSButton 
                  text="Tell us about your goals and what you hope to gain from Bridge. Share your motivation for joining."
                  className="text-xs"
                >
                  🔊
                </TTSButton>
              </div>
              <SpeechTextarea
                value={formData.motivation}
                onChange={(value) => updateFormData({ motivation: value })}
                placeholder={
                  formData.role === 'mentor' 
                    ? "I want to share my life experience and help young people navigate their careers and personal growth..."
                    : "I want to learn from experienced professionals and find mentorship in my career journey..."
                }
                rows={4}
                className="w-full"
              />
            </div>
            
            {/* Housing options for mentors */}
            {formData.role === 'mentor' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">I'm open to offering housing</div>
                    <div className="text-sm text-gray-600">Help students with affordable living options</div>
                  </div>
                  <button
                    onClick={() => updateFormData({ housing_offering: !formData.housing_offering })}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.housing_offering ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                    }`}
                  >
                    {formData.housing_offering && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            )}
            
            {/* Housing options for seekers */}
            {formData.role === 'seeker' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">I'm looking for housing</div>
                    <div className="text-sm text-gray-600">Interested in affordable living options</div>
                  </div>
                  <button
                    onClick={() => updateFormData({ housing_seeking: !formData.housing_seeking })}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.housing_seeking ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                    }`}
                  >
                    {formData.housing_seeking && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-center">Review Your Profile</h2>
              <TTSButton 
                text="Review Your Profile. Please review all your information before completing your profile. Make sure everything looks correct."
                className="text-lg"
              >
                🔊 Read Instructions
              </TTSButton>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <span className="font-medium">Name:</span> {formData.name}
              </div>
              <div>
                <span className="font-medium">Role:</span> {formData.role === 'mentor' ? '👵 Mentor' : '👩‍🎓 Student'}
              </div>
              <div>
                <span className="font-medium">Location:</span> {formData.location}
              </div>
              <div>
                <span className="font-medium">Interests:</span> {formData.interests.join(', ')}
              </div>
              <div>
                <span className="font-medium">Communication:</span> {formData.availability.communication_mode}
              </div>
              <div>
                <span className="font-medium">Motivation:</span> {formData.motivation}
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Ready to find your perfect match? Let's get started!
              </p>
              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
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
            <div className="flex items-center gap-4">
              <TTSControls compact={true} showSettings={false} />
              <div className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= currentStep
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i + 1 < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      i + 1 < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {renderStep()}
          
          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Complete Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
