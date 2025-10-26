// Groq integration for ultra-fast speech-to-text correction
import Groq from 'groq-sdk'

export interface GroqOptions {
  fieldType: 'name' | 'email' | 'location' | 'phone' | 'address' | 'general'
  originalText: string
  context?: string
}

export interface GroqResult {
  correctedText: string
  confidence: number
  suggestions?: string[]
  processingTime: number
  model: string
}

class GroqService {
  private client: Groq
  private readonly FAST_MODEL = 'llama-3.1-8b-instant' // Ultra-fast model for real-time
  private readonly QUALITY_MODEL = 'llama-3.3-70b-versatile' // High-quality model for complex tasks
  
  constructor() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      throw new Error('GroqService can only be used on the server side')
    }
    
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY || '',
    })
  }

  async correctText(options: GroqOptions): Promise<GroqResult> {
    const startTime = Date.now()
    
    try {
      // Use fast model for real-time speech correction
      const model = this.selectModel(options.fieldType)
      const prompt = this.buildPrompt(options)
      
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a specialized AI assistant for correcting speech-to-text transcription errors. You must return ONLY the corrected text, nothing else. Be fast and accurate.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: model,
        temperature: 0.1, // Low temperature for consistent corrections
        max_tokens: 50, // Keep responses short for speed
        stream: false
      })

      const correctedText = response.choices[0]?.message?.content?.trim() || options.originalText
      const processingTime = Date.now() - startTime
      
      console.log(`🚀 Groq ${model} processed in ${processingTime}ms:`, correctedText)
      
      return {
        correctedText,
        confidence: this.calculateConfidence(options.originalText, correctedText),
        suggestions: this.generateSuggestions(correctedText, options.fieldType),
        processingTime,
        model
      }
    } catch (error) {
      console.error('Groq API error:', error)
      throw error
    }
  }

  private selectModel(fieldType: string): string {
    // Use fast model for all corrections since it's reliable
    return this.FAST_MODEL
  }

  private buildPrompt(options: GroqOptions): string {
    const { fieldType, originalText } = options
    
    const prompts = {
      name: `Correct this name transcription: "${originalText}". Return only the corrected name with proper capitalization.`,
      
      email: `Correct this email transcription: "${originalText}". 
      
Convert speech patterns:
- "at" → "@"
- "dot" → "."
- "underscore" → "_"
- "dash" → "-"

Examples:
- "david at gmail dot com" → "david@gmail.com"
- "john underscore smith at yahoo dot com" → "john_smith@yahoo.com"

Return ONLY the corrected email address.`,
      
      location: `Correct this location transcription: "${originalText}". Return only the corrected location in "City, State" format.`,
      
      phone: `Correct this phone number transcription: "${originalText}". Return only the corrected phone number in (XXX) XXX-XXXX format.`,
      
      address: `Correct this address transcription: "${originalText}". Return only the corrected address with proper formatting.`,
      
      general: `Correct and improve this text transcription: "${originalText}". Return only the corrected text.`
    }

    return prompts[fieldType] || prompts.general
  }

  private calculateConfidence(original: string, corrected: string): number {
    // Simple confidence calculation based on similarity
    const similarity = this.calculateSimilarity(original, corrected)
    return Math.min(similarity + 0.2, 1.0) // Boost confidence for Groq
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  private generateSuggestions(correctedText: string, fieldType: string): string[] {
    const suggestions: string[] = []
    
    switch (fieldType) {
      case 'email':
        if (correctedText.includes('@gmail.com')) {
          suggestions.push('Try Yahoo or Outlook alternatives')
        }
        break
      case 'location':
        suggestions.push('Consider nearby cities')
        break
    }
    
    return suggestions.slice(0, 2) // Limit suggestions for speed
  }

  // Advanced multi-agent capabilities using Groq
  async analyzeUserCompatibility(user1: any, user2: any): Promise<GroqResult> {
    const startTime = Date.now()
    
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a compatibility analysis expert. Analyze user profiles and provide a compatibility score (0-1) and brief analysis.`
          },
          {
            role: 'user',
            content: `Analyze compatibility between these users:
            
User 1: ${JSON.stringify(user1)}
User 2: ${JSON.stringify(user2)}

Provide: Score (0-1), Analysis, Suggestions`
          }
        ],
        model: this.QUALITY_MODEL,
        temperature: 0.3,
        max_tokens: 200
      })

      const analysis = response.choices[0]?.message?.content?.trim() || ''
      
      return {
        correctedText: analysis,
        confidence: 0.9,
        suggestions: ['Schedule a video call', 'Share common interests'],
        processingTime: Date.now() - startTime,
        model: this.QUALITY_MODEL
      }
    } catch (error) {
      console.error('Groq compatibility analysis failed:', error)
      throw error
    }
  }

  async generateConversationStarters(userProfile: any, matchProfile: any): Promise<GroqResult> {
    const startTime = Date.now()
    
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a conversation expert. Generate 3 engaging conversation starters based on user profiles.`
          },
          {
            role: 'user',
            content: `Generate conversation starters for:
            
User: ${JSON.stringify(userProfile)}
Match: ${JSON.stringify(matchProfile)}

Provide 3 conversation starters.`
          }
        ],
        model: this.QUALITY_MODEL,
        temperature: 0.7,
        max_tokens: 150
      })

      const starters = response.choices[0]?.message?.content?.trim() || ''
      
      return {
        correctedText: starters,
        confidence: 0.8,
        suggestions: ['Ask follow-up questions', 'Share personal experiences'],
        processingTime: Date.now() - startTime,
        model: this.QUALITY_MODEL
      }
    } catch (error) {
      console.error('Groq conversation generation failed:', error)
      throw error
    }
  }

  async analyzeMessageSafety(message: string, context?: any): Promise<GroqResult> {
    const startTime = Date.now()
    
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a safety analysis expert. Analyze messages for safety concerns. Respond with: SAFE/UNSAFE, Score (0-1), Analysis.`
          },
          {
            role: 'user',
            content: `Analyze this message for safety: "${message}"
            
Context: ${JSON.stringify(context || {})}`
          }
        ],
        model: this.QUALITY_MODEL,
        temperature: 0.1,
        max_tokens: 100
      })

      const analysis = response.choices[0]?.message?.content?.trim() || ''
      const isSafe = !analysis.toLowerCase().includes('unsafe')
      
      return {
        correctedText: analysis,
        confidence: isSafe ? 0.9 : 0.7,
        suggestions: isSafe ? [] : ['Review message content', 'Report if necessary'],
        processingTime: Date.now() - startTime,
        model: this.QUALITY_MODEL
      }
    } catch (error) {
      console.error('Groq safety analysis failed:', error)
      throw error
    }
  }
}

// Export singleton instance
export const groqService = new GroqService()
