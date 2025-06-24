import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { attendanceEventCounter } from '@/lib/prometheus'

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

    const flaskResponse = await fetch(`${process.env.FLASK_SERVICE_URL}/recognize_faces`, {
      method: 'POST',
      body: flaskFormData,
    })

    if (!flaskResponse.ok) {
      throw new Error('Face recognition service error')
    }

    const recognitionResult = await flaskResponse.json()
    
    const attendance = await prisma.attendance.create({
      data: {
        userId: session.user.id,
        imagePath: `/uploads/${imageFile.name}`,
        totalDetected: recognitionResult.total_faces,
      }
    })

    const attendanceRecords = []
    
    for (const recognizedFace of recognitionResult.recognized_faces) {
      // Skip unknown faces
      if (recognizedFace.name === 'Unknown') {
        continue
      }

      let person = await prisma.person.findUnique({
        where: { name: recognizedFace.name }
      })

      if (!person) {
        person = await prisma.person.create({
          data: {
            name: recognizedFace.name,
            imagePaths: []
          }
        })
      }

      const attendanceRecord = await prisma.attendanceRecord.create({
        data: {
          attendanceId: attendance.id,
          personId: person.id,
          confidence: recognizedFace.recognition_confidence || recognizedFace.confidence,
          faceId: recognizedFace.face_id,
          bbox: recognizedFace.bbox ? JSON.stringify(recognizedFace.bbox) : null
        }
      })

      attendanceRecords.push({
        id: attendanceRecord.id,
        personName: person.name,
        confidence: recognizedFace.recognition_confidence || recognizedFace.confidence,
        faceId: recognizedFace.face_id,
        bbox: recognizedFace.bbox,
        createdAt: attendanceRecord.createdAt
      })
    }

    attendanceEventCounter.inc({ 
      event_type: 'attendance_taken', 
      user_id: session.user.id 
    })

    return NextResponse.json({
      success: true,
      attendanceId: attendance.id,
      totalFaces: recognitionResult.total_faces,
      recognizedFaces: attendanceRecords.length,
      unknownFaces: recognitionResult.recognized_faces.filter((f: any) => f.name === 'Unknown').length,
      attendanceRecords,
      rawResults: recognitionResult.recognized_faces // Include for debugging/advanced features
    })

  } catch (error) {
    console.error('Attendance processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process attendance' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const attendances = await prisma.attendance.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        attendanceRecords: {
          include: {
            person: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const total = await prisma.attendance.count({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({
      attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    )
  }
}