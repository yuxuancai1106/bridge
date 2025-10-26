'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface TTSOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: string
}

interface TTSState {
  isEnabled: boolean
  isSpeaking: boolean
  isPaused: boolean
  isListening: boolean
  currentText: string
  voices: SpeechSynthesisVoice[]
  selectedVoice: string
  rate: number
  pitch: number
  volume: number
  recognition: any
  lastCommand: string
}

export const useTTS = () => {
  const [state, setState] = useState<TTSState>({
    isEnabled: false,
    isSpeaking: false,
    isPaused: false,
    isListening: false,
    currentText: '',
    voices: [],
    selectedVoice: '',
    rate: 0.8, // Slower for older adults
    pitch: 1.0,
    volume: 0.9,
    recognition: null,
    lastCommand: ''
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true }))
      }
      
      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        // Process both final and interim results for stop commands
        const allText = (finalTranscript + interimTranscript).toLowerCase().trim()
        if (allText.includes('stop') || allText.includes('pause') || allText.includes('quiet')) {
          console.log('Stop command detected in interim/final:', allText)
          handleVoiceCommand(allText)
        } else if (finalTranscript) {
          handleVoiceCommand(finalTranscript.toLowerCase().trim())
        }
      }
      
      recognition.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error)
        setState(prev => ({ ...prev, isListening: false }))
      }
      
      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }))
      }
      
      recognitionRef.current = recognition
      setState(prev => ({ ...prev, recognition }))
    }
  }, [])

  // Start listening for voice commands
  const startListening = useCallback(() => {
    if (recognitionRef.current && state.isEnabled) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.log('Speech recognition already started or not available')
      }
    }
  }, [state.isEnabled])

  // Stop listening for voice commands
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const speak = useCallback((text: string, options?: TTSOptions) => {
    if (!state.isEnabled || !text.trim()) return

    console.log('TTS: Starting to speak:', text.substring(0, 50) + '...')
    
    // Stop any current speech
    stop()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set voice
    const voice = state.voices.find(v => v.name === (options?.voice || state.selectedVoice))
    if (voice) {
      utterance.voice = voice
    }

    // Set options
    utterance.rate = options?.rate ?? state.rate
    utterance.pitch = options?.pitch ?? state.pitch
    utterance.volume = options?.volume ?? state.volume

    // Event handlers
    utterance.onstart = () => {
      setState(prev => ({
        ...prev,
        isSpeaking: true,
        isPaused: false,
        currentText: text
      }))
      // Start listening for voice commands when speaking
      startListening()
    }

    utterance.onend = () => {
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
        currentText: ''
      }))
      utteranceRef.current = null
      // Stop listening when done speaking
      stopListening()
    }

    utterance.onerror = (event) => {
      // Only log actual errors, not interruptions (which are expected when stopping)
      if (event.error !== 'interrupted') {
        console.error('TTS Error:', event.error)
      }
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
        currentText: ''
      }))
      utteranceRef.current = null
      stopListening()
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }, [state.isEnabled, state.voices, state.selectedVoice, state.rate, state.pitch, state.volume])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setState(prev => ({
      ...prev,
      isSpeaking: false,
      isPaused: false,
      currentText: ''
    }))
    utteranceRef.current = null
    stopListening()
  }, [stopListening])

  const updateSettings = useCallback((updates: Partial<Pick<TTSState, 'rate' | 'pitch' | 'volume' | 'selectedVoice'>>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: string) => {
    console.log('Voice command received:', command)
    setState(prev => ({ ...prev, lastCommand: command }))
    
    // Stop speaking commands - be more aggressive
    if (command.includes('stop') || command.includes('pause') || command.includes('quiet') || command.includes('shut up')) {
      console.log('Stopping speech due to voice command')
      speechSynthesis.cancel() // Force stop immediately
      utteranceRef.current = null
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
        currentText: ''
      }))
      // Don't speak response immediately, wait a bit
      setTimeout(() => {
        speak("I'll stop speaking now.")
      }, 500)
      return
    }
    // Help commands
    else if (command.includes('help') || command.includes('what can you do')) {
      speak("I can read text aloud, stop speaking when you say stop, and listen to your voice commands. Try saying 'stop' to interrupt me, or 'help' for more options.")
    }
    // Repeat commands
    else if (command.includes('repeat') || command.includes('again')) {
      if (state.currentText) {
        speak(state.currentText)
      } else {
        speak("I don't have anything to repeat. Please try reading some text first.")
      }
    }
    // Speed commands
    else if (command.includes('slower') || command.includes('slow down')) {
      const newRate = Math.max(0.5, state.rate - 0.1)
      updateSettings({ rate: newRate })
      speak(`I'll speak slower now. Rate set to ${newRate.toFixed(1)}`)
    }
    else if (command.includes('faster') || command.includes('speed up')) {
      const newRate = Math.min(1.5, state.rate + 0.1)
      updateSettings({ rate: newRate })
      speak(`I'll speak faster now. Rate set to ${newRate.toFixed(1)}`)
    }
    // Volume commands
    else if (command.includes('louder') || command.includes('volume up')) {
      const newVolume = Math.min(1.0, state.volume + 0.1)
      updateSettings({ volume: newVolume })
      speak(`Volume increased to ${Math.round(newVolume * 100)} percent`)
    }
    else if (command.includes('quieter') || command.includes('volume down')) {
      const newVolume = Math.max(0.1, state.volume - 0.1)
      updateSettings({ volume: newVolume })
      speak(`Volume decreased to ${Math.round(newVolume * 100)} percent`)
    }
    // Default response for unrecognized commands
    else if (command.length > 3) {
      speak(`I heard you say "${command}". You can say "stop" to interrupt me, "help" for options, or "repeat" to repeat the last text.`)
    }
  }, [state.rate, state.volume, state.currentText, updateSettings])

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      setState(prev => ({
        ...prev,
        voices,
        selectedVoice: voices.find(v => v.lang.startsWith('en'))?.name || voices[0]?.name || ''
      }))
    }

    // Load voices immediately
    loadVoices()

    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (speechSynthesis.onvoiceschanged) {
        speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const pause = useCallback(() => {
    if (state.isSpeaking && !state.isPaused) {
      speechSynthesis.pause()
      setState(prev => ({ ...prev, isPaused: true }))
    }
  }, [state.isSpeaking, state.isPaused])

  const resume = useCallback(() => {
    if (state.isSpeaking && state.isPaused) {
      speechSynthesis.resume()
      setState(prev => ({ ...prev, isPaused: false }))
    }
  }, [state.isSpeaking, state.isPaused])

  const toggleEnabled = useCallback(() => {
    const newEnabled = !state.isEnabled
    setState(prev => ({ ...prev, isEnabled: newEnabled }))
    
    if (!newEnabled) {
      stop()
    }
  }, [state.isEnabled, stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
      stopListening()
    }
  }, [stop, stopListening])

  return {
    // State
    isEnabled: state.isEnabled,
    isSpeaking: state.isSpeaking,
    isPaused: state.isPaused,
    isListening: state.isListening,
    currentText: state.currentText,
    voices: state.voices,
    selectedVoice: state.selectedVoice,
    rate: state.rate,
    pitch: state.pitch,
    volume: state.volume,
    lastCommand: state.lastCommand,

    // Actions
    speak,
    pause,
    resume,
    stop,
    toggleEnabled,
    updateSettings,
    startListening,
    stopListening
  }
}
