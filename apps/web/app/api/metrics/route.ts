import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const promClient = require('prom-client')
    const register = promClient.register
    
    const metrics = await register.metrics()
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    )
  }
} 