'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'

interface SpeechTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  rows?: number
  onFocus?: () => void
  onBlur?: () => void
}

export default function SpeechTextarea({
  value,
  onChange,
  placeholder = "Click microphone to speak or type here...",
  className = "",
  disabled = false,
  rows = 4,
  onFocus,
  onBlur
}: SpeechTextareaProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check if speech recognition is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      setIsSupported(!!SpeechRecognition)
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        
        recognition.onstart = () => {
          setIsListening(true)
          setError(null)
        }
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          onChange(transcript)
          setIsListening(false)
        }
        
        recognition.onerror = (event: any) => {
          console.log('Speech recognition error:', event.error)
          setIsListening(false)
          
          switch (event.error) {
            case 'no-speech':
              setError('No speech detected. Please try again.')
              break
            case 'audio-capture':
              setError('Microphone not found. Please check your microphone.')
              break
            case 'not-allowed':
              setError('Microphone permission denied. Please allow microphone access.')
              break
            case 'network':
              setError('Network error. Please check your connection.')
              break
            default:
              setError('Speech recognition error. Please try again.')
          }
        }
        
        recognition.onend = () => {
          setIsListening(false)
        }
        
        recognitionRef.current = recognition
      }
    }
  }, [onChange])

  const startListening = () => {
    if (!isSupported || !recognitionRef.current || disabled) return
    
    try {
      recognitionRef.current.start()
    } catch (error) {
      console.log('Speech recognition already started or not available')
      setError('Speech recognition not available. Please try again.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <div className={`speech-textarea-container ${className}`}>
      <div className="speech-textarea-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            clearError()
          }}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          rows={rows}
          className="speech-textarea-field"
        />
        
        {isSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            className={`speech-mic-button ${isListening ? 'listening' : ''}`}
            title={isListening ? 'Stop listening' : 'Click to speak'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="speech-error">
          <Volume2 className="w-4 h-4" />
          <span>{error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}
      
      {/* Listening indicator */}
      {isListening && (
        <div className="speech-listening">
          <div className="pulse-dot"></div>
          <span>Listening... Speak now</span>
        </div>
      )}
      
      {/* Help text */}
      {isSupported && !isListening && !error && (
        <div className="speech-help">
          💡 Click the microphone to speak your answer
        </div>
      )}

      <style jsx>{`
        .speech-textarea-container {
          width: 100%;
        }

        .speech-textarea-wrapper {
          position: relative;
          display: flex;
          align-items: flex-start;
        }

        .speech-textarea-field {
          width: 100%;
          padding: 12px 50px 12px 16px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          background: white;
          transition: all 0.2s ease;
          resize: none;
          font-family: inherit;
        }

        .speech-textarea-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .speech-textarea-field:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .speech-mic-button {
          position: absolute;
          right: 8px;
          top: 8px;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          background: #f3f4f6;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .speech-mic-button:hover:not(:disabled) {
          background: #e5e7eb;
          color: #374151;
        }

        .speech-mic-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .speech-mic-button.listening {
          background: #fef3c7;
          color: #f59e0b;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .speech-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 8px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 14px;
        }

        .error-close {
          margin-left: auto;
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .speech-listening {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 8px 12px;
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 6px;
          color: #0369a1;
          font-size: 14px;
        }

        .speech-help {
          margin-top: 8px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #64748b;
          font-size: 14px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #0ea5e9;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .speech-textarea-field {
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </div>
  )
}
