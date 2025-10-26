'use client'

import { useTTS } from '@/hooks/useTTS'

interface TTSButtonProps {
  text: string
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  title?: string
  onClick?: () => void
}

export default function TTSButton({
  text,
  className = '',
  children,
  disabled = false,
  title,
  onClick
}: TTSButtonProps) {
  const { isEnabled, speak, isSpeaking, stop, toggleEnabled } = useTTS()

  const handleClick = () => {
    // If TTS is not enabled, enable it first
    if (!isEnabled) {
      toggleEnabled()
      // Wait a bit for TTS to initialize, then speak
      setTimeout(() => {
        speak(text)
        if (onClick) {
          onClick()
        }
      }, 100)
    } else if (!disabled) {
      // If currently speaking, stop it
      if (isSpeaking) {
        stop()
      } else {
        // If not speaking, start speaking
        speak(text)
      }
      if (onClick) {
        onClick()
      }
    }
  }

  const isActive = isEnabled && isSpeaking

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`tts-button ${className} ${isActive ? 'active' : ''}`}
      title={title || (isEnabled ? (isSpeaking ? 'Stop speaking' : 'Read aloud') : 'Click to enable TTS and read aloud')}
    >
      {children || (
        <span className="tts-button-content">
          <span className="tts-icon">{isSpeaking ? '⏹️' : '🔊'}</span>
          <span className="tts-text">{isSpeaking ? 'Stop' : 'Read'}</span>
        </span>
      )}
      
      <style jsx>{`
        .tts-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          color: #374151;
          min-height: 44px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .tts-button:hover:not(:disabled) {
          border-color: #3b82f6;
          background: #f8fafc;
          transform: translateY(-1px);
        }

        .tts-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tts-button.active {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .tts-button-content {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tts-icon {
          font-size: 16px;
        }

        .tts-text {
          font-size: 14px;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .tts-button {
            padding: 6px 10px;
            font-size: 12px;
            min-height: 40px;
          }
          
          .tts-icon {
            font-size: 14px;
          }
        }
      `}</style>
    </button>
  )
}
