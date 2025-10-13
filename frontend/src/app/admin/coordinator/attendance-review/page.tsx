"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Users, CheckCircle, AlertCircle, Eye, RefreshCw, Edit3 } from "lucide-react"
import { getCurrentUserProfile, getCoordinatorClasses, getLevelAttendanceSummary } from "@/lib/api"
import { useRouter } from "next/navigation"

interface CoordinatorProfile {
  level?: {
    id: number;
    name: string;
  };
}

interface ClassroomData {
  id: number;
  name: string;
  code: string;
  grade: string;
  section: string;
  shift: string;
  campus: string;
  class_teacher: {
    id: number;
    name: string;
    username: string;
  } | null;
  student_count: number;
}

interface AttendanceSummary {
  level_id: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_classrooms: number;
    total_students: number;
    total_present: number;
    total_absent: number;
    total_late: number;
    total_leave: number;
    overall_percentage: number;
  };
  classrooms: Array<{
    classroom: {
      id: number;
      name: string;
      code: string;
      grade: string;
      section: string;
      shift: string;
      campus: string;
    };
    student_count: number;
    records_count: number;
    total_present: number;
    total_absent: number;
    total_late: number;
    total_leave: number;
    average_percentage: number;
    last_attendance: string | null;
  }>;
}

export default function AttendanceReviewPage() {
  const [coordinatorProfile, setCoordinatorProfile] = useState<CoordinatorProfile | null>(null);
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [selectedClass, setSelectedClass] = useState("all");
  const router = useRouter();

  useEffect(() => {
    document.title = "Attendance Review - Coordinator | IAK SMS";
    fetchCoordinatorData();
  }, []);

  useEffect(() => {
    if (coordinatorProfile?.level) {
      fetchAttendanceSummary();
    }
  }, [coordinatorProfile, selectedMonth]);

  const fetchCoordinatorData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const profile = await getCurrentUserProfile() as CoordinatorProfile;
      
      if (!profile) {
        setError("Failed to load coordinator profile. Please login again.");
        setTimeout(() => {
          router.push('/Universal_Login');
        }, 2000);
        return;
      }
      
      if (!profile.level) {
        setError("No level assigned to you. Please contact administrator.");
        return;
      }

      setCoordinatorProfile(profile);
      
      // Fetch classrooms in coordinator's level
      const classesData = await getCoordinatorClasses() as ClassroomData[];
      setClassrooms(classesData);
      
    } catch (err: unknown) {
      console.error('Error fetching coordinator data:', err);
      setError("Failed to load coordinator data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummary = async () => {
    if (!coordinatorProfile?.level) return;

    try {
      setLoading(true);
      
      // Calculate date range based on selected month
      const now = new Date();
      let startDate: string;
      let endDate: string = now.toISOString().split('T')[0];
      
      if (selectedMonth === 'current') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      } else if (selectedMonth === 'last30') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      } else {
        // Custom month selection
        const monthDate = new Date(selectedMonth);
        startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().split('T')[0];
      }
      
      const summary = await getLevelAttendanceSummary(
        coordinatorProfile.level.id, 
        startDate, 
        endDate
      ) as AttendanceSummary;
      
      setAttendanceSummary(summary);
      
    } catch (err: unknown) {
      console.error('Error fetching attendance summary:', err);
      setError("Failed to load attendance summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const viewClassDetails = (classroomId: number) => {
    router.push(`/admin/coordinator/attendance-review/${classroomId}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-12 p-10 bg-[#e7ecef] rounded-2xl shadow-2xl border-2 border-[#a3cef1]">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-[#6096ba]" />
            <span className="text-[#274c77] font-medium">Loading attendance data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-12 p-10 bg-[#e7ecef] rounded-2xl shadow-2xl border-2 border-[#a3cef1]">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#274c77] mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchCoordinatorData} className="bg-[#6096ba] hover:bg-[#274c77] text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#274c77] to-[#6096ba] rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Attendance Review</h1>
            <div className="flex items-center space-x-4 text-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{coordinatorProfile?.level?.name} Level</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{classrooms.length} Classes</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={fetchAttendanceSummary}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Time Period</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="2024-01">January 2024</SelectItem>
                  <SelectItem value="2024-02">February 2024</SelectItem>
                  <SelectItem value="2024-03">March 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Class Filter</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classrooms.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {attendanceSummary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Overall Attendance</p>
                    <p className="text-2xl font-bold">{attendanceSummary.summary.overall_percentage}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Students</p>
                    <p className="text-2xl font-bold">{attendanceSummary.summary.total_students}</p>
                  </div>
                  <Users className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Present</p>
                    <p className="text-2xl font-bold">{attendanceSummary.summary.total_present}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Absent</p>
                    <p className="text-2xl font-bold">{attendanceSummary.summary.total_absent}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class-wise Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#274c77]">Class-wise Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Class</th>
                      <th className="text-left p-2">Teacher</th>
                      <th className="text-left p-2">Students</th>
                      <th className="text-left p-2">Records</th>
                      <th className="text-left p-2">Present</th>
                      <th className="text-left p-2">Absent</th>
                      <th className="text-left p-2">Average %</th>
                      <th className="text-left p-2">Last Attendance</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceSummary.classrooms.map((classData) => (
                      <tr key={classData.classroom.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{classData.classroom.name}</td>
                        <td className="p-2">{(classData as any).classroom.class_teacher?.name || 'N/A'}</td>
                        <td className="p-2">{classData.student_count}</td>
                        <td className="p-2">{classData.records_count}</td>
                        <td className="p-2">
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            {classData.total_present}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge className="bg-red-100 text-red-800 border-red-300">
                            {classData.total_absent}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={getAttendanceColor(classData.average_percentage)}>
                            {classData.average_percentage}%
                          </Badge>
                        </td>
                        <td className="p-2">
                          {classData.last_attendance 
                            ? new Date(classData.last_attendance).toLocaleDateString()
                            : 'No records'
                          }
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewClassDetails(classData.classroom.id)}
                              className="border-[#6096ba] text-[#6096ba] hover:bg-[#6096ba] hover:text-white"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/teachers/attendance?classroom=${classData.classroom.id}`)}
                              className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}