import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Person {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    imagePaths: string[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all attendance sessions
    const attendanceSessions = await prisma.attendance.findMany({
      include: {
        attendanceRecords: {
          include: {
            person: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all people from the dataset
    const allPeople = await prisma.person.findMany()

    // Calculate statistics
    const totalSessions = attendanceSessions.length
    const totalPeople = allPeople.length

    // Build attendance by person data
    const attendanceByPerson = allPeople.map((person: Person) => {
      const attendedSessions = attendanceSessions.filter(session => 
        session.attendanceRecords.some(record => record.personId === person.id)
      ).length

      return {
        name: person.name,
        attended: attendedSessions,
        total: totalSessions,
        percentage: totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0
      }
    })

    // Build attendance by date data
    const attendanceByDate = attendanceSessions.map(session => {
      const present = session.attendanceRecords.length
      const absent = totalPeople - present
      const date = session.createdAt.toISOString().split('T')[0] // YYYY-MM-DD format

      return {
        date,
        present,
        absent,
        total: totalPeople
      }
    }).reverse() // Show chronological order

    // Calculate average attendance
    const totalAttendanceRecords = attendanceSessions.reduce(
      (sum, session) => sum + session.attendanceRecords.length, 
      0
    )
    const totalPossibleAttendance = totalSessions * totalPeople
    const averageAttendance = totalPossibleAttendance > 0 
      ? (totalAttendanceRecords / totalPossibleAttendance) * 100 
      : 0

    const analytics = {
      totalSessions,
      totalPeople,
      averageAttendance,
      attendanceByPerson,
      attendanceByDate
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance analytics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 