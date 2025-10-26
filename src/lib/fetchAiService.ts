// Fetch.ai integration for intelligent speech-to-text correction
export interface FetchAiOptions {
  fieldType: 'name' | 'email' | 'location' | 'phone' | 'address' | 'general'
  originalText: string
  context?: string
}

export interface FetchAiResult {
  correctedText: string
  confidence: number
  suggestions?: string[]
  agentUsed?: string
  processingTime?: number
}

class FetchAiService {
  private readonly ASI_ONE_API_URL = 'https://api.asi1.ai'
  private readonly ASI_ONE_ENDPOINT = '/v1/chat/completions'
  
  // Fallback to local processing if Fetch.ai is unavailable
  private readonly FALLBACK_MODE = true

  async correctText(options: FetchAiOptions): Promise<FetchAiResult> {
    const startTime = Date.now()
    
    try {
      // Try Fetch.ai ASI:One first
      const result = await this.callAsiOne(options)
      
      return {
        ...result,
        agentUsed: 'ASI:One',
        processingTime: Date.now() - startTime
      }
    } catch (error) {
      console.warn('Fetch.ai ASI:One failed, falling back to local processing:', error)
      
      // Fallback to local processing
      const fallbackResult = await this.localProcessing(options)
      
      return {
        ...fallbackResult,
        agentUsed: 'Local Fallback',
        processingTime: Date.now() - startTime
      }
    }
  }

  private async callAsiOne(options: FetchAiOptions): Promise<FetchAiResult> {
    const { fieldType, originalText, context } = options
    
    // Create a context-aware prompt for ASI:One
    const prompt = this.buildAsiOnePrompt(fieldType, originalText, context)
    
    try {
      const response = await fetch(`${this.ASI_ONE_API_URL}${this.ASI_ONE_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FETCH_AI_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'asi-one',
          messages: [
            {
              role: 'system',
              content: `You are an AI agent specialized in correcting speech-to-text transcription errors. You must return ONLY the corrected text, nothing else.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.1, // Low temperature for consistent corrections
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`ASI:One API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Extract corrected text from ASI:One response
      const correctedText = data.choices?.[0]?.message?.content?.trim() || originalText
      
      return {
        correctedText,
        confidence: 0.9, // High confidence for ASI:One
        suggestions: []
      }
    } catch (error) {
      console.error('ASI:One API call failed:', error)
      throw error
    }
  }

  private buildAsiOnePrompt(fieldType: string, originalText: string, context?: string): string {
    const basePrompt = `You are an AI agent specialized in correcting speech-to-text transcription errors. 
    
Context: ${context || 'User is filling out a form using voice input'}
Field Type: ${fieldType}
Original Speech Input: "${originalText}"

Your task is to correct the speech-to-text output to proper format.`

    const fieldSpecificPrompts = {
      email: `
For EMAIL fields, convert speech patterns to proper email format:
- "at" → "@"
- "dot" → "."
- "underscore" → "_"
- "dash" → "-"
- "dot com" → ".com"
- "dot org" → ".org"

Examples:
- "david at gmail dot com" → "david@gmail.com"
- "john underscore smith at yahoo dot com" → "john_smith@yahoo.com"
- "mary dash jones at university dot edu" → "mary-jones@university.edu"

Return ONLY the corrected email address.`,

      name: `
For NAME fields, apply proper capitalization:
- Capitalize first letter of each word
- Handle common name patterns

Examples:
- "john smith" → "John Smith"
- "MARY JOHNSON" → "Mary Johnson"
- "david michael jones" → "David Michael Jones"

Return ONLY the corrected name.`,

      location: `
For LOCATION fields, format as "City, State":
- Capitalize city and state names
- Use proper state abbreviations when appropriate

Examples:
- "berkeley california" → "Berkeley, CA"
- "new york new york" → "New York, NY"
- "san francisco california" → "San Francisco, CA"

Return ONLY the corrected location.`,

      phone: `
For PHONE fields, format as standard phone number:
- Convert spoken numbers to digits
- Format as (XXX) XXX-XXXX for US numbers

Examples:
- "five five five one two three four five six seven" → "(555) 123-4567"
- "my phone is five five five dash one two three dash four five six seven" → "(555) 123-4567"

Return ONLY the corrected phone number.`,

      address: `
For ADDRESS fields, format with proper abbreviations:
- Convert street types to abbreviations (Street → St, Avenue → Ave)
- Capitalize properly
- Handle apartment/suite numbers

Examples:
- "one two three main street" → "123 Main St"
- "four five six oak avenue apartment five" → "456 Oak Ave Apt 5"

Return ONLY the corrected address.`,

      general: `
For GENERAL text, apply basic corrections:
- Fix capitalization
- Remove extra spaces
- Correct common speech-to-text errors

Return ONLY the corrected text.`
    }

    return basePrompt + (fieldSpecificPrompts[fieldType as keyof typeof fieldSpecificPrompts] || fieldSpecificPrompts.general)
  }

  private async localProcessing(options: FetchAiOptions): Promise<FetchAiResult> {
    // Fallback to the existing local processing logic
    const { fieldType, originalText } = options
    
    const normalizers = {
      email: this.spokenToEmail.bind(this),
      name: this.spokenToName.bind(this),
      location: this.spokenToLocation.bind(this),
      phone: this.spokenToPhone.bind(this),
      address: this.spokenToAddress.bind(this),
      general: this.spokenToGenericText.bind(this)
    }
    
    const normalizer = normalizers[fieldType as keyof typeof normalizers] || normalizers.general
    const correctedText = normalizer(originalText)
    
    return {
      correctedText,
      confidence: this.calculateConfidence(originalText, correctedText),
      suggestions: []
    }
  }

  // Import the existing normalization methods
  private spokenToEmail(text: string): string {
    console.log('Fetch.ai: Correcting email:', text)
    
    const TOKEN_MAP: { [key: string]: string } = {
      'at': '@', 'atsign': '@', 'at sign': '@',
      'dot': '.', 'period': '.', 'point': '.',
      'underscore': '_', 'dash': '-', 'hyphen': '-', 'minus': '-',
      'dotcom': '.com', 'dot org': '.org', 'dot edu': '.edu', 'dot gov': '.gov',
      'space': '', 'comma': ''
    }
    
    let corrected = text.toLowerCase().trim()
    corrected = corrected.replace(/^(my email is|email is|my email|email)\s+/i, '')
    corrected = corrected.replace(/\b(at sign|atsign)\b/g, 'at')
    corrected = corrected.replace(/\b(at)\b/gi, ' at ')
    
    const tokens = corrected.split(/\s+|[,;]+/).filter(Boolean)
    const singleLetterCount = tokens.filter(tok => tok.length === 1 || /^[a-z]$/.test(tok)).length
    const mostlyLetters = singleLetterCount / tokens.length > 0.6
    
    let out = ''
    if (mostlyLetters) {
      for (let tok of tokens) {
        tok = tok.trim()
        if (!tok) continue
        if (TOKEN_MAP[tok]) {
          out += TOKEN_MAP[tok]
        } else if (/^[a-z]$/.test(tok)) {
          out += tok
        } else if (/^\d$/.test(tok)) {
          out += tok
        } else {
          out += tok
        }
      }
    } else {
      for (let i = 0; i < tokens.length; i++) {
        let tok = tokens[i]
        if (!tok) continue
        
        if (tok === 'dot' && tokens[i+1]) {
          const next = tokens[i+1].replace(/\W/g,'')
          if (next.match(/^(com|org|edu|gov|net)$/)) {
            out += '.' + next
            i++
            continue
          }
        }
        
        if (TOKEN_MAP[tok]) {
          out += TOKEN_MAP[tok]
        } else {
          out += tok
        }
      }
    }
    
    out = out.replace(/\s+/g, '')
    out = out.replace(/\.{2,}/g, '.')
    out = out.replace(/@{2,}/g, '@')
    out = out.replace(/[^\w@.\-+_]+$/g, '')
    out = out.replace(/\.?dotcom$/,'.com')
    
    const isValidEmail = (email: string) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      return re.test(email)
    }
    
    if (!isValidEmail(out)) {
      return text
    }
    
    return out
  }

  private spokenToName(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private spokenToLocation(text: string): string {
    const parts = text.split(',').map(part => part.trim())
    
    if (parts.length >= 2) {
      const city = parts[0].split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
      const state = parts[1].toUpperCase()
      return `${city}, ${state}`
    }
    
    return text
  }

  private spokenToPhone(text: string): string {
    const PHONE_MAP: { [key: string]: string } = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      'dash': '-', 'hyphen': '-', 'space': '',
      'open paren': '(', 'close paren': ')'
    }
    
    let corrected = text.toLowerCase().trim()
    corrected = corrected.replace(/^(my phone is|phone is|my phone|phone number is|number is)\s+/i, '')
    
    const tokens = corrected.split(/\s+/).filter(Boolean)
    let out = ''
    
    for (let token of tokens) {
      if (PHONE_MAP[token]) {
        out += PHONE_MAP[token]
      } else if (/^\d$/.test(token)) {
        out += token
      } else if (/^[a-z]$/.test(token)) {
        const letterMap: { [key: string]: string } = {
          'o': '0', 'i': '1', 'l': '1'
        }
        out += letterMap[token] || token
      }
    }
    
    out = out.replace(/[^\d\-\(\)\s]/g, '')
    out = out.replace(/\s+/g, '')
    
    if (out.length === 10) {
      out = `(${out.slice(0,3)}) ${out.slice(3,6)}-${out.slice(6)}`
    }
    
    return out || text
  }

  private spokenToAddress(text: string): string {
    const ADDRESS_MAP: { [key: string]: string } = {
      'street': 'St', 'avenue': 'Ave', 'boulevard': 'Blvd', 'road': 'Rd',
      'drive': 'Dr', 'lane': 'Ln', 'court': 'Ct', 'place': 'Pl',
      'circle': 'Cir', 'way': 'Way', 'north': 'N', 'south': 'S',
      'east': 'E', 'west': 'W', 'northeast': 'NE', 'northwest': 'NW',
      'southeast': 'SE', 'southwest': 'SW', 'apartment': 'Apt',
      'suite': 'Ste', 'unit': 'Unit', 'number': '#', 'pound': '#'
    }
    
    let corrected = text.toLowerCase().trim()
    corrected = corrected.replace(/^(my address is|address is|my address|address)\s+/i, '')
    
    const tokens = corrected.split(/\s+/).filter(Boolean)
    let out = ''
    
    for (let token of tokens) {
      if (ADDRESS_MAP[token]) {
        out += ADDRESS_MAP[token] + ' '
      } else if (/^\d+$/.test(token)) {
        out += token + ' '
      } else {
        out += token.charAt(0).toUpperCase() + token.slice(1) + ' '
      }
    }
    
    out = out.trim()
    out = out.replace(/\s+/g, ' ')
    
    return out || text
  }

  private spokenToGenericText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/(^|\.\s+)([a-z])/g, (match, prefix, letter) => 
        prefix + letter.toUpperCase()
      )
  }

  private calculateConfidence(original: string, corrected: string): number {
    const similarity = this.calculateSimilarity(original, corrected)
    return Math.min(similarity + 0.3, 1.0)
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
}

// Export singleton instance
export const fetchAiService = new FetchAiService()
