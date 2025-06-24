import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const flaskFormData = new FormData()
    flaskFormData.append('image', imageFile)

    const flaskResponse = await fetch(`${process.env.FLASK_SERVICE_URL}/detect_faces`, {
      method: 'POST',
      body: flaskFormData,
    })

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text()
      throw new Error(`Face detection service error: ${errorText}`)
    }

    const detectionResult = await flaskResponse.json()
    
    return NextResponse.json({
      success: true,
      facesDetected: detectionResult.faces_detected,
      faces: detectionResult.faces.map((face: any) => ({
        faceId: face.face_id,
        bbox: face.bbox,
        confidence: face.confidence,
        landmarks: face.landmarks,
        faceCrop: face.face_crop_base64
      }))
    })

  } catch (error) {
    console.error('Face detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect faces' },
      { status: 500 }
    )
  }
} 