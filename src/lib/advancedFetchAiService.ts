// Advanced ASI:One integration with multi-agent capabilities
export interface AdvancedFetchAiOptions {
  taskType: 'speech-correction' | 'user-matching' | 'safety-analysis' | 'conversation-starter' | 'profile-optimization' | 'sentiment-analysis'
  input: string
  context?: any
  userId?: string
  sessionId?: string
}

export interface AdvancedFetchAiResult {
  result: any
  confidence: number
  agentsUsed: string[]
  processingTime: number
  suggestions?: string[]
  nextActions?: string[]
}

class AdvancedFetchAiService {
  private readonly ASI_ONE_API_URL = 'https://api.asi1.ai'
  private readonly ASI_ONE_ENDPOINT = '/v1/chat/completions'
  
  // Available agents in the Fetch.ai ecosystem
  private readonly AVAILABLE_AGENTS = {
    'speech-correction': 'Speech-to-text correction specialist',
    'user-matching': 'Compatibility and matching algorithm expert',
    'safety-analysis': 'Safety and risk assessment specialist',
    'conversation-starter': 'Conversation and engagement expert',
    'profile-optimization': 'Profile enhancement and optimization specialist',
    'sentiment-analysis': 'Emotional intelligence and sentiment analysis expert',
    'data-analysis': 'Analytics and insights specialist',
    'recommendation-engine': 'Personalized recommendation expert'
  }

  async processAdvancedTask(options: AdvancedFetchAiOptions): Promise<AdvancedFetchAiResult> {
    const startTime = Date.now()
    
    try {
      // Create a multi-agent orchestration prompt
      const orchestrationPrompt = this.buildOrchestrationPrompt(options)
      
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
              content: `You are ASI:One, an agent-orchestrating AI brain. You can call upon specialized agents to complete complex tasks. You have access to these agents:

${Object.entries(this.AVAILABLE_AGENTS).map(([agent, description]) => 
  `- ${agent}: ${description}`
).join('\n')}

When given a task, analyze it and determine which agents to call. You can call multiple agents in sequence or parallel. Always return structured results with agent information.`
            },
            {
              role: 'user',
              content: orchestrationPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`ASI:One API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const result = data.choices?.[0]?.message?.content?.trim() || ''
      
      // Parse the multi-agent response
      const parsedResult = this.parseMultiAgentResponse(result, options.taskType)
      
      return {
        result: parsedResult.result,
        confidence: parsedResult.confidence,
        agentsUsed: parsedResult.agentsUsed,
        processingTime: Date.now() - startTime,
        suggestions: parsedResult.suggestions,
        nextActions: parsedResult.nextActions
      }
    } catch (error) {
      console.error('Advanced ASI:One processing failed:', error)
      throw error
    }
  }

  private buildOrchestrationPrompt(options: AdvancedFetchAiOptions): string {
    const { taskType, input, context, userId, sessionId } = options
    
    const basePrompt = `Task Type: ${taskType}
Input: "${input}"
Context: ${JSON.stringify(context || {})}
User ID: ${userId || 'anonymous'}
Session ID: ${sessionId || 'new-session'}

Please analyze this task and determine which agents to call. Return your response in this JSON format:
{
  "agentsUsed": ["agent1", "agent2"],
  "result": "main result",
  "confidence": 0.9,
  "suggestions": ["suggestion1", "suggestion2"],
  "nextActions": ["action1", "action2"]
}`

    const taskSpecificPrompts = {
      'speech-correction': `${basePrompt}

This is a speech-to-text correction task. Call the speech-correction agent to fix the input text.`,

      'user-matching': `${basePrompt}

This is a user matching task. Call the user-matching agent to find compatible users based on the input profile data. Consider compatibility factors like interests, location, availability, and personality traits.`,

      'safety-analysis': `${basePrompt}

This is a safety analysis task. Call the safety-analysis agent to assess potential risks in user interactions, messages, or profiles. Look for red flags, inappropriate content, or safety concerns.`,

      'conversation-starter': `${basePrompt}

This is a conversation starter task. Call the conversation-starter agent to generate engaging conversation topics, icebreakers, or discussion prompts based on user profiles and interests.`,

      'profile-optimization': `${basePrompt}

This is a profile optimization task. Call the profile-optimization agent to suggest improvements to user profiles, better descriptions, or ways to make profiles more appealing and authentic.`,

      'sentiment-analysis': `${basePrompt}

This is a sentiment analysis task. Call the sentiment-analysis agent to analyze the emotional tone, mood, and sentiment of messages or user interactions.`
    }

    return taskSpecificPrompts[taskType] || basePrompt
  }

  private parseMultiAgentResponse(response: string, taskType: string): any {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, using fallback parsing')
    }

    // Fallback parsing for non-JSON responses
    const agentsUsed = this.extractAgentsUsed(response)
    const confidence = this.extractConfidence(response)
    
    return {
      result: response,
      confidence: confidence || 0.8,
      agentsUsed: agentsUsed || [taskType],
      suggestions: this.extractSuggestions(response),
      nextActions: this.extractNextActions(response)
    }
  }

  private extractAgentsUsed(response: string): string[] {
    const agentMatches = response.match(/agents?[:\s]+\[?([^\]]+)\]?/i)
    if (agentMatches) {
      return agentMatches[1].split(',').map(agent => agent.trim().replace(/['"]/g, ''))
    }
    
    // Look for agent names in the response
    const foundAgents = Object.keys(this.AVAILABLE_AGENTS).filter(agent => 
      response.toLowerCase().includes(agent.toLowerCase())
    )
    
    return foundAgents.length > 0 ? foundAgents : ['asi-one']
  }

  private extractConfidence(response: string): number {
    const confidenceMatch = response.match(/confidence[:\s]+(\d+\.?\d*)/i)
    return confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8
  }

  private extractSuggestions(response: string): string[] {
    const suggestionsMatch = response.match(/suggestions?[:\s]+\[?([^\]]+)\]?/i)
    if (suggestionsMatch) {
      return suggestionsMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''))
    }
    return []
  }

  private extractNextActions(response: string): string[] {
    const actionsMatch = response.match(/nextActions?[:\s]+\[?([^\]]+)\]?/i)
    if (actionsMatch) {
      return actionsMatch[1].split(',').map(a => a.trim().replace(/['"]/g, ''))
    }
    return []
  }

  // Specialized methods for different task types
  async analyzeUserCompatibility(user1: any, user2: any): Promise<AdvancedFetchAiResult> {
    return this.processAdvancedTask({
      taskType: 'user-matching',
      input: `User 1: ${JSON.stringify(user1)}\nUser 2: ${JSON.stringify(user2)}`,
      context: { user1, user2 }
    })
  }

  async generateConversationStarters(userProfile: any, matchProfile: any): Promise<AdvancedFetchAiResult> {
    return this.processAdvancedTask({
      taskType: 'conversation-starter',
      input: `User Profile: ${JSON.stringify(userProfile)}\nMatch Profile: ${JSON.stringify(matchProfile)}`,
      context: { userProfile, matchProfile }
    })
  }

  async analyzeMessageSafety(message: string, senderId: string, receiverId: string): Promise<AdvancedFetchAiResult> {
    return this.processAdvancedTask({
      taskType: 'safety-analysis',
      input: message,
      context: { senderId, receiverId, messageType: 'chat' }
    })
  }

  async optimizeUserProfile(profile: any): Promise<AdvancedFetchAiResult> {
    return this.processAdvancedTask({
      taskType: 'profile-optimization',
      input: JSON.stringify(profile),
      context: { profile }
    })
  }

  async analyzeSentiment(text: string, context?: any): Promise<AdvancedFetchAiResult> {
    return this.processAdvancedTask({
      taskType: 'sentiment-analysis',
      input: text,
      context: context || {}
    })
  }
}

// Export singleton instance
export const advancedFetchAiService = new AdvancedFetchAiService()
