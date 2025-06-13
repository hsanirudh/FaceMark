"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppNavigation } from "@/components/AppNavigation";
import { Download, BarChart3, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

interface AttendanceStats {
  totalSessions: number;
  totalPeople: number;
  averageAttendance: number;
  attendanceByPerson: Array<{
    name: string;
    attended: number;
    total: number;
    percentage: number;
  }>;
  attendanceByDate: Array<{
    date: string;
    present: number;
    absent: number;
    total: number;
  }>;
}

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchAttendanceStats();
    }
  }, [session]);

  const fetchAttendanceStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analytics/attendance");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error("Failed to fetch attendance analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch attendance analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!stats) return;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Attendance by Person sheet
    const personData = stats.attendanceByPerson.map((person) => ({
      Name: person.name,
      "Sessions Attended": person.attended,
      "Total Sessions": person.total,
      "Attendance Percentage": `${person.percentage.toFixed(1)}%`,
      "Absence Percentage": `${(100 - person.percentage).toFixed(1)}%`,
    }));
    const personWS = XLSX.utils.json_to_sheet(personData);
    XLSX.utils.book_append_sheet(wb, personWS, "Attendance by Person");

    // Attendance by Date sheet
    const dateData = stats.attendanceByDate.map((date) => ({
      Date: date.date,
      Present: date.present,
      Absent: date.absent,
      Total: date.total,
      "Attendance Rate": `${((date.present / date.total) * 100).toFixed(1)}%`,
    }));
    const dateWS = XLSX.utils.json_to_sheet(dateData);
    XLSX.utils.book_append_sheet(wb, dateWS, "Attendance by Date");

    // Summary sheet
    const summaryData = [
      { Metric: "Total Sessions", Value: stats.totalSessions },
      { Metric: "Total People", Value: stats.totalPeople },
      {
        Metric: "Average Attendance",
        Value: `${stats.averageAttendance.toFixed(1)}%`,
      },
    ];
    const summaryWS = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");

    // Export
    const fileName = `attendance-analytics-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Analytics exported successfully!");
  };

  const getAbsenceData = () => {
    if (!stats) return [];

    return stats.attendanceByPerson.map((person) => {
      const attendance = Number(person.percentage.toFixed(2));
      const absence = Number((100 - person.percentage).toFixed(2));

      return {
        name: person.name,
        attendance,
        absence,
      };
    });
  };

  const averageAttendance = stats
    ? Number(stats.averageAttendance.toFixed(2))
    : 0;
  const averageAbsence = stats
    ? Number((100 - stats.averageAttendance).toFixed(2))
    : 0;

  if (!session) {
    return (
      <>
        <AppNavigation />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access attendance analytics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavigation />
      <div className="min-h-screen bg-black p-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Attendance Analytics
                </h1>
                <p className="text-sm sm:text-base text-gray-400">
                  Comprehensive attendance insights and reports
                </p>
              </div>
              <Button
                onClick={exportToExcel}
                disabled={!stats}
                className="flex items-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>

                {/* Summary Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart 1 Skeleton */}
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end h-48">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center space-y-2"
                            >
                              <Skeleton
                                className={`w-12 h-${
                                  Math.floor(Math.random() * 32) + 16
                                }`}
                              />
                              <Skeleton className="w-16 h-3" />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="w-3 h-3" />
                            <Skeleton className="w-16 h-3" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Skeleton className="w-3 h-3" />
                            <Skeleton className="w-16 h-3" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chart 2 Skeleton */}
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-56" />
                      <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center h-48">
                        <div className="relative">
                          <Skeleton className="w-32 h-32 rounded-full" />
                          <div className="absolute inset-4">
                            <Skeleton className="w-24 h-24 rounded-full" />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center space-x-6 mt-4">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-3 h-3" />
                          <Skeleton className="w-12 h-3" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-3 h-3" />
                          <Skeleton className="w-12 h-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Time Series Chart Skeleton */}
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end h-64">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <div
                            key={i}
                            className="flex flex-col items-center space-y-2"
                          >
                            <div className="flex space-x-1">
                              <Skeleton
                                className={`w-6 h-${
                                  Math.floor(Math.random() * 24) + 8
                                }`}
                              />
                              <Skeleton
                                className={`w-6 h-${
                                  Math.floor(Math.random() * 16) + 4
                                }`}
                              />
                            </div>
                            <Skeleton className="w-16 h-3" />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-3 h-3" />
                          <Skeleton className="w-12 h-3" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-3 h-3" />
                          <Skeleton className="w-12 h-3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Table Skeleton */}
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-5 gap-4 pb-2 border-b border-gray-800">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      {/* Table Rows */}
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="grid grid-cols-5 gap-4 py-2 border-b border-gray-800"
                        >
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : stats ? (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">
                        Total Sessions
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">
                        {stats.totalSessions}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">
                        Total People
                      </CardTitle>
                      <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">
                        {stats.totalPeople}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="sm:col-span-2 md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">
                        Average Attendance
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">
                        {stats.averageAttendance.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* Attendance vs Absence Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">
                        Attendance vs Absence by Person
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Percentage breakdown of attendance and absence rates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={getAbsenceData()}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            fontSize={12}
                          />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="attendance"
                            fill="#22c55e"
                            name="Attendance %"
                          />
                          <Bar
                            dataKey="absence"
                            fill="#ef4444"
                            name="Absence %"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Overall Attendance Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">
                        Overall Attendance Distribution
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Average attendance vs absence across all sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Present",
                                value: averageAttendance,
                                fill: "#22c55e",
                              },
                              {
                                name: "Absent",
                                value: averageAbsence,
                                fill: "#ef4444",
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) =>
                              `${name}: ${value.toFixed(2)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              {
                                name: "Present",
                                value: averageAttendance,
                                fill: "#22c55e",
                              },
                              {
                                name: "Absent",
                                value: averageAbsence,
                                fill: "#ef4444",
                              },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance by Date */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      Attendance Trends Over Time
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Daily attendance and absence counts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.attendanceByDate}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="present" fill="#22c55e" name="Present" />
                        <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      Individual Attendance Records
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Detailed breakdown by person
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left p-1 sm:p-2">Name</th>
                            <th className="text-right p-1 sm:p-2">
                              <span className="hidden sm:inline">
                                Sessions{" "}
                              </span>
                              Attended
                            </th>
                            <th className="text-right p-1 sm:p-2">
                              <span className="hidden sm:inline">Total </span>
                              Sessions
                            </th>
                            <th className="text-right p-1 sm:p-2">Attend %</th>
                            <th className="text-right p-1 sm:p-2">Absent %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.attendanceByPerson.map((person, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-800"
                            >
                              <td className="p-1 sm:p-2 font-medium">
                                {person.name}
                              </td>
                              <td className="p-1 sm:p-2 text-right">
                                {person.attended}
                              </td>
                              <td className="p-1 sm:p-2 text-right">
                                {person.total}
                              </td>
                              <td className="p-1 sm:p-2 text-right text-green-400">
                                {person.percentage.toFixed(1)}%
                              </td>
                              <td className="p-1 sm:p-2 text-right text-red-400">
                                {(100 - person.percentage).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance data available</p>
                <p className="text-sm">
                  Start tracking attendance to see analytics
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
