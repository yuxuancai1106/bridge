'use client'

import { useState } from 'react'
import { useTTS } from '@/hooks/useTTS'

interface TTSControlsProps {
  className?: string
  showSettings?: boolean
  compact?: boolean
}

export default function TTSControls({ 
  className = '', 
  showSettings = true, 
  compact = false 
}: TTSControlsProps) {
  const {
    isEnabled,
    isSpeaking,
    isPaused,
    isListening,
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    speak,
    pause,
    resume,
    stop,
    toggleEnabled,
    updateSettings,
    lastCommand
  } = useTTS()

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const handleSpeak = (text: string) => {
    if (isEnabled) {
      speak(text)
    }
  }

  const handlePlayPause = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    }
  }

  const handleStop = () => {
    stop()
  }

  const handleVoiceChange = (voiceName: string) => {
    updateSettings({ selectedVoice: voiceName })
  }

  const handleRateChange = (newRate: number) => {
    updateSettings({ rate: newRate })
  }

  const handlePitchChange = (newPitch: number) => {
    updateSettings({ pitch: newPitch })
  }

  const handleVolumeChange = (newVolume: number) => {
    updateSettings({ volume: newVolume })
  }

  if (compact) {
    return (
      <div className={`tts-controls-compact ${className}`}>
        <button
          onClick={toggleEnabled}
          className={`tts-toggle-btn ${isEnabled ? 'active' : ''}`}
          title={isEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
        >
          {isEnabled ? '🔊' : '🔇'}
        </button>
        
        {isEnabled && isSpeaking && (
          <div className="tts-controls-mini">
            <button onClick={handlePlayPause} title={isPaused ? 'Resume' : 'Pause'}>
              {isPaused ? '▶️' : '⏸️'}
            </button>
            <button onClick={handleStop} title="Stop">
              ⏹️
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`tts-controls ${className}`}>
      {/* Main Toggle */}
      <div className="tts-main-controls">
        <button
          onClick={toggleEnabled}
          className={`tts-toggle-btn ${isEnabled ? 'active' : ''}`}
          title={isEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
        >
          <span className="tts-icon">
            {isEnabled ? (isListening ? '🎤' : '🔊') : '🔇'}
          </span>
          <span className="tts-label">
            {isEnabled ? (isListening ? 'Listening' : 'TTS On') : 'TTS Off'}
          </span>
        </button>

        {/* Voice Command Indicator */}
        {isEnabled && lastCommand && (
          <div className="voice-command-indicator">
            <span className="command-text">Last command: "{lastCommand}"</span>
          </div>
        )}

        {/* Listening Indicator */}
        {isEnabled && isListening && (
          <div className="listening-indicator">
            <div className="pulse-dot"></div>
            <span>Listening for voice commands...</span>
          </div>
        )}

        {/* Playback Controls */}
        {isEnabled && isSpeaking && (
          <div className="tts-playback-controls">
            <button 
              onClick={handlePlayPause}
              className="tts-control-btn"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? '▶️' : '⏸️'}
            </button>
            <button 
              onClick={handleStop}
              className="tts-control-btn"
              title="Stop"
            >
              ⏹️
            </button>
          </div>
        )}

        {/* Help Button */}
        {isEnabled && (
          <button
            onClick={() => speak("Voice commands available: Say 'stop' to interrupt, 'help' for options, 'repeat' to repeat text, 'slower' or 'faster' to adjust speed, 'louder' or 'quieter' to adjust volume.")}
            className="tts-help-btn"
            title="Voice Commands Help"
          >
            ❓ Help
          </button>
        )}
      </div>

      {/* Settings Panel */}
      {isEnabled && showSettings && (
        <div className="tts-settings-panel">
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="tts-settings-toggle"
          >
            ⚙️ Settings {showAdvancedSettings ? '▼' : '▶'}
          </button>

          {showAdvancedSettings && (
            <div className="tts-advanced-settings">
              {/* Voice Selection */}
              <div className="tts-setting-group">
                <label className="tts-setting-label">Voice:</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="tts-select"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speech Rate */}
              <div className="tts-setting-group">
                <label className="tts-setting-label">
                  Speed: {rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={rate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="tts-slider"
                />
              </div>

              {/* Pitch */}
              <div className="tts-setting-group">
                <label className="tts-setting-label">
                  Pitch: {pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                  className="tts-slider"
                />
              </div>

              {/* Volume */}
              <div className="tts-setting-group">
                <label className="tts-setting-label">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="tts-slider"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .tts-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .tts-controls-compact {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tts-main-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tts-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
          font-weight: 600;
          min-height: 48px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .tts-toggle-btn:hover {
          border-color: #3b82f6;
          transform: translateY(-1px);
        }

        .tts-toggle-btn.active {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .tts-icon {
          font-size: 20px;
        }

        .tts-label {
          font-size: 14px;
        }

        .tts-playback-controls {
          display: flex;
          gap: 8px;
        }

        .tts-control-btn {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
          min-width: 44px;
          min-height: 44px;
        }

        .tts-control-btn:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .tts-help-btn {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          color: #6b7280;
          min-width: 44px;
          min-height: 44px;
        }

        .tts-help-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .tts-settings-panel {
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
        }

        .tts-settings-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        .tts-settings-toggle:hover {
          color: #374151;
        }

        .tts-advanced-settings {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tts-setting-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tts-setting-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .tts-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          min-height: 44px;
        }

        .tts-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          outline: none;
          -webkit-appearance: none;
        }

        .tts-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .tts-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .voice-command-indicator {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 6px;
          padding: 8px 12px;
          margin-top: 8px;
          font-size: 12px;
          color: #0369a1;
        }

        .listening-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 8px 12px;
          margin-top: 8px;
          font-size: 12px;
          color: #92400e;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #f59e0b;
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
          .tts-controls {
            padding: 12px;
          }
          
          .tts-toggle-btn {
            padding: 10px 14px;
            font-size: 14px;
          }
          
          .tts-icon {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  )
}
