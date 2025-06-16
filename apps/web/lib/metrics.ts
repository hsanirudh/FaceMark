import { buttonClickCounter, authEventCounter, attendanceEventCounter } from './prometheus'

export const trackButtonClick = (buttonType: string, page: string) => {
  try {
    buttonClickCounter.inc({ button_type: buttonType, page })
  } catch (error) {
    // Silently fail on client side
  }
}

export const trackAuthEvent = (eventType: string, provider: string = 'unknown') => {
  try {
    authEventCounter.inc({ event_type: eventType, provider })
  } catch (error) {
    // Silently fail on client side
  }
}

export const trackAttendanceEvent = (eventType: string, userId: string = 'unknown') => {
  try {
    attendanceEventCounter.inc({ event_type: eventType, user_id: userId })
  } catch (error) {
    // Silently fail on client side
  }
}

// Helper to send metrics to server-side endpoint
export const sendMetricToServer = async (metricType: string, data: Record<string, string>) => {
  try {
    await fetch('/api/metrics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: metricType, data })
    })
  } catch (error) {
    console.error('Failed to send metric:', error)
  }
} 