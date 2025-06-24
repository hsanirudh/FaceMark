import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const flaskResponse = await fetch(`${process.env.FLASK_SERVICE_URL}/health`, {
      method: 'GET',
    })

    if (!flaskResponse.ok) {
      throw new Error('ML service unavailable')
    }

    const healthResult = await flaskResponse.json()
    
    return NextResponse.json({
      success: true,
      mlService: {
        status: healthResult.status,
        detectionModelLoaded: healthResult.detection_model_loaded,
        recognitionModelLoaded: healthResult.recognition_model_loaded,
        datasetSize: healthResult.dataset_size
      },
      webService: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        success: false,
        mlService: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        webService: {
          status: 'healthy',
          timestamp: new Date().toISOString()
        }
      },
      { status: 503 }
    )
  }
} 