'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { llmService, LLMCorrectionOptions } from '@/lib/llmService'

interface SpeechInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  onFocus?: () => void
  onBlur?: () => void
  fieldType?: 'name' | 'email' | 'location' | 'phone' | 'address' | 'general'
  enableLLMCorrection?: boolean
}

export default function SpeechInput({
  value,
  onChange,
  placeholder = "Click microphone to speak or type here...",
  className = "",
  disabled = false,
  onFocus,
  onBlur,
  fieldType = 'general',
  enableLLMCorrection = true
}: SpeechInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [correctionResult, setCorrectionResult] = useState<{
    original: string
    corrected: string
    confidence: number
    agentUsed?: string
    processingTime?: number
  } | null>(null)
  const recognitionRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
        
        recognition.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript
          setIsListening(false)
          
          if (enableLLMCorrection && transcript.trim()) {
            setIsCorrecting(true)
            try {
              const correctionOptions: LLMCorrectionOptions = {
                fieldType,
                originalText: transcript
              }
              const result = await llmService.correctText(correctionOptions)
              
              setCorrectionResult({
                original: transcript,
                corrected: result.correctedText,
                confidence: result.confidence,
                agentUsed: result.agentUsed,
                processingTime: result.processingTime
              })
              
              // Auto-apply correction if confidence is high
              if (result.confidence > 0.7) {
                onChange(result.correctedText)
              } else {
                onChange(transcript) // Use original if confidence is low
              }
            } catch (error) {
              console.error('LLM correction failed:', error)
              onChange(transcript) // Fallback to original
            } finally {
              setIsCorrecting(false)
            }
          } else {
            onChange(transcript)
          }
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
    <div className={`speech-input-container ${className}`}>
      <div className="speech-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            clearError()
          }}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          className="speech-input-field"
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
      {isSupported && !isListening && !error && !isCorrecting && (
        <div className="speech-help">
          💡 Click the microphone to speak your answer
        </div>
      )}

      {/* LLM Correction Results */}
      {correctionResult && (
        <div className="correction-result">
          <div className="correction-header">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>AI Correction Applied</span>
            <span className="confidence">({Math.round(correctionResult.confidence * 100)}% confidence)</span>
            {correctionResult.agentUsed && (
              <span className="agent-used">via {correctionResult.agentUsed}</span>
            )}
            {correctionResult.processingTime && (
              <span className="processing-time">({correctionResult.processingTime}ms)</span>
            )}
          </div>
          <div className="correction-details">
            <div className="original">
              <strong>Original:</strong> {correctionResult.original}
            </div>
            <div className="corrected">
              <strong>Corrected:</strong> {correctionResult.corrected}
            </div>
          </div>
          <div className="correction-actions">
            <button 
              onClick={() => onChange(correctionResult.original)}
              className="revert-btn"
            >
              Revert to Original
            </button>
            <button 
              onClick={() => setCorrectionResult(null)}
              className="dismiss-btn"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator for LLM correction */}
      {isCorrecting && (
        <div className="correction-loading">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>AI is correcting your input...</span>
        </div>
      )}

      <style jsx>{`
        .speech-input-container {
          width: 100%;
        }

        .speech-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .speech-input-field {
          width: 100%;
          padding: 12px 50px 12px 16px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          background: white;
          transition: all 0.2s ease;
          min-height: 48px;
        }

        .speech-input-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .speech-input-field:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .speech-mic-button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
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

        .correction-result {
          margin-top: 8px;
          padding: 12px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
        }

        .correction-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          color: #166534;
        }

        .confidence {
          font-size: 12px;
          color: #16a34a;
          font-weight: normal;
        }

        .agent-used {
          font-size: 11px;
          color: #059669;
          font-weight: 500;
          background: #ecfdf5;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
        }

        .processing-time {
          font-size: 10px;
          color: #6b7280;
          font-weight: normal;
          margin-left: 4px;
        }

        .correction-details {
          margin-bottom: 12px;
          font-size: 14px;
        }

        .original {
          margin-bottom: 4px;
          color: #6b7280;
        }

        .corrected {
          color: #166534;
        }

        .correction-actions {
          display: flex;
          gap: 8px;
        }

        .revert-btn, .dismiss-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .revert-btn:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        .dismiss-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .correction-loading {
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
          .speech-input-field {
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </div>
  )
}
