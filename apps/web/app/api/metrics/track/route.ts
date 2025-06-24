import { NextRequest, NextResponse } from 'next/server'
import { buttonClickCounter, authEventCounter, attendanceEventCounter } from '../../../../lib/prometheus'

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()
    
    switch (type) {
      case 'button_click':
        buttonClickCounter.inc({
          button_type: data.button_type || 'unknown',
          page: data.page || 'unknown'
        })
        break
        
      case 'auth_event':
        authEventCounter.inc({
          event_type: data.event_type || 'unknown',
          provider: data.provider || 'unknown'
        })
        break
        
      case 'attendance_event':
        attendanceEventCounter.inc({
          event_type: data.event_type || 'unknown',
          user_id: data.user_id || 'unknown'
        })
        break
        
      default:
        return NextResponse.json({ error: 'Unknown metric type' }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Metrics tracking error:', error)
    return NextResponse.json({ error: 'Failed to track metric' }, { status: 500 })
  }
} 