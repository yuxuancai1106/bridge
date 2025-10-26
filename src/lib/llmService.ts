// LLM service for correcting speech-to-text output
import { fetchAiService, FetchAiOptions, FetchAiResult } from './fetchAiService'

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
      // Use Fetch.ai as the primary service
      const fetchAiOptions: FetchAiOptions = {
        fieldType: options.fieldType,
        originalText: options.originalText,
        context: options.context
      }
      
      const result = await fetchAiService.correctText(fetchAiOptions)
      
      return {
        correctedText: result.correctedText,
        confidence: result.confidence,
        suggestions: result.suggestions,
        agentUsed: result.agentUsed,
        processingTime: result.processingTime
      }
    } catch (error) {
      console.error('LLM correction error:', error)
      // Fallback to original text if all services fail
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