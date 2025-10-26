import { groqService } from '@/lib/groqService'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fieldType, originalText, context } = body

    const result = await groqService.correctText({
      fieldType: fieldType || 'general',
      originalText: originalText || '',
      context: context
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Groq API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
