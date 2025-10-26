import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  age: number
  location: string
  pronouns: string
  role: 'mentor' | 'seeker'
  interests: string[]
  personality: {
    extrovert: boolean
    patient: boolean
    humorous: boolean
    empathetic: boolean
  }
  availability: {
    preferred_times: string[]
    communication_mode: 'video' | 'in-person' | 'both'
  }
  motivation: string
  housing_offering?: boolean
  housing_seeking?: boolean
  verified: boolean
  community_score: number
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  user_id: string
  matched_user_id: string
  compatibility_score: number
  interest_overlap: number
  personality_score: number
  motivation_score: number
  location_score: number
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: 'text' | 'image' | 'system'
  created_at: string
  read_at?: string
}

export interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  last_message_at: string
  created_at: string
}

export interface MatchScore {
  user: User
  compatibility_score: number
  interest_overlap: number
  personality_score: number
  motivation_score: number
  location_score: number
  breakdown: {
    interests: string[]
    personality_match: string[]
    motivation_alignment: string
  }
}
