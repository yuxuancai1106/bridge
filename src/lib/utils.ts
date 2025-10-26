import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Interest categories for matching
export const INTEREST_CATEGORIES = [
  'Technology',
  'Cooking',
  'Gardening',
  'Reading',
  'Travel',
  'Photography',
  'Music',
  'Art',
  'Sports',
  'Volunteering',
  'Business',
  'Education',
  'Health & Wellness',
  'Movies',
  'Writing',
  'Crafts',
  'Dancing',
  'Hiking',
  'Meditation',
  'Languages'
] as const

// Personality traits
export const PERSONALITY_TRAITS = [
  { key: 'extrovert', label: 'Extroverted', description: 'Enjoys social interaction' },
  { key: 'patient', label: 'Patient', description: 'Takes time to explain things' },
  { key: 'humorous', label: 'Humorous', description: 'Likes to make people laugh' },
  { key: 'empathetic', label: 'Empathetic', description: 'Understands others\' feelings' }
] as const

// Availability preferences
export const AVAILABILITY_TIMES = [
  'morning',
  'afternoon', 
  'evening',
  'weekend'
] as const

export const COMMUNICATION_MODES = [
  { value: 'video', label: 'Video Calls', icon: '📹' },
  { value: 'in-person', label: 'In Person', icon: '🤝' },
  { value: 'both', label: 'Both', icon: '💬' }
] as const

// Conversation starters
export const CONVERSATION_STARTERS = [
  "What's something you learned this week?",
  "Tell me about a memorable experience from your career.",
  "What's your favorite way to spend a weekend?",
  "What advice would you give to someone starting out?",
  "What's something you're curious about lately?",
  "Tell me about a hobby you enjoy.",
  "What's the best piece of advice you've ever received?",
  "What's something that always makes you smile?"
] as const

// Safety tips
export const SAFETY_TIPS = [
  "Always meet in public for your first meeting",
  "Never share financial information",
  "Trust your instincts - if something feels wrong, it probably is",
  "Let someone know where you're going",
  "Keep personal information private until you build trust"
] as const
