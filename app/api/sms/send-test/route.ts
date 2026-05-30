import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, phoneNumber, variables } = body

    if (!templateId || !phoneNumber) {
      return NextResponse.json(
        { error: 'templateId and phoneNumber are required' },
        { status: 400 }
      )
    }

    // Validate phone number format (basic validation)
    if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Mock SMS sending - in production, integrate with Twilio, AWS SNS, etc.
    console.log('[SMS Service] Sending test SMS:', {
      templateId,
      phoneNumber,
      variables,
      timestamp: new Date().toISOString(),
    })

    // Simulate API response
    return NextResponse.json({
      success: true,
      message: 'Test SMS sent successfully',
      details: {
        templateId,
        phoneNumber,
        timestamp: new Date().toISOString(),
        status: 'pending',
        sid: `SM_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send test SMS' },
      { status: 400 }
    )
  }
}
