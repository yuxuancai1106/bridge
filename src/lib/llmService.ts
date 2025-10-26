// LLM service for correcting speech-to-text output
// Uses API route to securely call Groq from client-side

export interface LLMCorrectionOptions {
  fieldType: 'name' | 'email' | 'location' | 'phone' | 'address' | 'general'
  originalText: string
  context?: string
}

export interface LLMCorrectionResult {
  correctedText: string
  confidence: number
  suggestions?: string[]
  agentUsed?: string
  processingTime?: number
}

class LLMService {
  async correctText(options: LLMCorrectionOptions): Promise<LLMCorrectionResult> {
    try {
      // Call our API route which runs server-side
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fieldType: options.fieldType,
          originalText: options.originalText,
          context: options.context
        })
      })

      const data = await response.json()

      if (data.success) {
        return {
          correctedText: data.data.correctedText,
          confidence: data.data.confidence,
          suggestions: data.data.suggestions,
          agentUsed: `Groq ${data.data.model}`,
          processingTime: data.data.processingTime
        }
      } else {
        throw new Error(data.error || 'LLM correction failed')
      }
    } catch (error) {
      console.error('LLM correction error:', error)
      // Fallback to original text if Groq fails
      return {
        correctedText: options.originalText,
        confidence: 0,
        suggestions: [],
        agentUsed: 'Fallback',
        processingTime: 0
      }
    }
  }
}

// Export singleton instance
export const llmService = new LLMService()