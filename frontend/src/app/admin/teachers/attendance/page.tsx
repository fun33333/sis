"use client";
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Save, RefreshCw, Edit3, History } from "lucide-react";
import { getCurrentUserRole } from "@/lib/permissions";
import { getCurrentUserProfile, getClassStudents, markBulkAttendance, getAttendanceHistory, getAttendanceForDate, editAttendance } from "@/lib/api";
import { useRouter } from "next/navigation";

type AttendanceStatus = "present" | "absent" | "leave";

interface Student {
  id: number;
  name: string;
  student_code: string;
  gr_no?: string;
  gender: string;
  photo?: string;
}

interface ClassInfo {
  id: number;
  name: string;
  code: string;
  grade: string;
  section: string;
  shift: string;
  campus?: string;
}

interface AttendanceRecord {
  student_id: number;
  status: AttendanceStatus;
  remarks?: string;
}

interface AttendanceResult {
  message: string;
  attendance_id: number;
  total_students: number;
  present_count: number;
  absent_count: number;
  attendance_percentage: number;
}

interface TeacherProfile {
  assigned_classroom?: {
    id: number;
    name: string;
    code: string;
    grade?: { name: string };
    section: string;
    shift: string;
    campus?: { campus_name: string };
  };
}

export default function TeacherAttendancePage() {
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [attendanceHistory] = useState<unknown[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingAttendanceId, setExistingAttendanceId] = useState<number | null>(null);
  const router = useRouter();

  const userRole = getCurrentUserRole();

  useEffect(() => {
    if (userRole === 'teacher') {
      document.title = "Mark Attendance | IAK SMS";
      fetchTeacherData();
    }
  }, [userRole]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get teacher's profile and classroom
      const teacherProfile = await getCurrentUserProfile() as TeacherProfile;
      
      if (!teacherProfile) {
        setError("Failed to load user profile. Please login again.");
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/Universal_Login');
        }, 2000);
        return;
      }
      
      if (!teacherProfile.assigned_classroom) {
        setError("No classroom assigned to you. Please contact administrator.");
        return;
      }

      // Set class info
      setClassInfo({
        id: teacherProfile.assigned_classroom.id,
        name: teacherProfile.assigned_classroom.name || "Unknown Class",
        code: teacherProfile.assigned_classroom.code || "",
        grade: teacherProfile.assigned_classroom.grade?.name || "",
        section: teacherProfile.assigned_classroom.section || "",
        shift: teacherProfile.assigned_classroom.shift || "",
        campus: teacherProfile.assigned_classroom.campus?.campus_name || ""
      });

      // Fetch students for this classroom
      const studentsData = await getClassStudents(teacherProfile.assigned_classroom.id) as Student[];
      console.log('Fetched students:', studentsData);
      setStudents(studentsData);

      // Load existing attendance for today if any
      await loadExistingAttendance(teacherProfile.assigned_classroom.id, selectedDate);

    } catch (err: unknown) {
      console.error('Error fetching teacher data:', err);
      setError("Failed to load class data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAttendance = async (classroomId: number, date: string) => {
    try {
      const attendanceData = await getAttendanceForDate(classroomId, date) as any;
      if (attendanceData && attendanceData.id) {
        const existingAttendance: Record<number, AttendanceStatus> = {};
        attendanceData.student_attendance.forEach((record: any) => {
          existingAttendance[record.student_id] = record.status;
        });
        setAttendance(existingAttendance);
        setIsEditMode(true);
        setExistingAttendanceId(attendanceData.id);
      } else {
        setAttendance({});
        setIsEditMode(false);
        setExistingAttendanceId(null);
      }
    } catch (error: unknown) {
      console.error('Error loading existing attendance:', error);
      setAttendance({});
      setIsEditMode(false);
      setExistingAttendanceId(null);
    }
  };

  const handleAttendanceChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    setAttendance({});
    setIsEditMode(false);
    setExistingAttendanceId(null);
    
    if (classInfo) {
      await loadExistingAttendance(classInfo.id, newDate);
    }
  };

  const handleSubmit = async () => {
    if (!classInfo) return;

    try {
      setSaving(true);
      
      // Prepare student attendance data
      const studentAttendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        status: status,
        remarks: ''
      }));

      let result;
      
      if (isEditMode && existingAttendanceId) {
        // Edit existing attendance
        result = await editAttendance(existingAttendanceId, {
          student_attendance: studentAttendanceData
        });
      } else {
        // Mark new attendance
        const presentStudents = Object.entries(attendance)
          .filter(([_, status]) => status === 'present')
          .map(([studentId, _]) => parseInt(studentId));

        result = await markBulkAttendance({
          classroom_id: classInfo.id,
          date: selectedDate,
          present_students: presentStudents
        });
      }

      alert(`Attendance ${isEditMode ? 'updated' : 'marked'} successfully!`);
      
      // Refresh data
      await fetchTeacherData();
      
    } catch (err: unknown) {
      console.error('Error marking attendance:', err);
      alert(`Failed to ${isEditMode ? 'update' : 'mark'} attendance. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const newAttendance: Record<number, AttendanceStatus> = {};
    students.forEach(student => {
      newAttendance[student.id] = 'present';
    });
    setAttendance(newAttendance);
  };

  const markAllAbsent = () => {
    const newAttendance: Record<number, AttendanceStatus> = {};
    students.forEach(student => {
      newAttendance[student.id] = 'absent';
    });
    setAttendance(newAttendance);
  };

  // Calculate stats
  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = Object.values(attendance).filter(status => status === 'absent').length;
  const leaveCount = Object.values(attendance).filter(status => status === 'leave').length;
  const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Check if date is editable (within 7 days)
  const isDateEditable = () => {
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - selectedDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-12 p-10 bg-[#e7ecef] rounded-2xl shadow-2xl border-2 border-[#a3cef1]">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-[#6096ba]" />
            <span className="text-[#274c77] font-medium">Loading class data...</span>
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
            <Button onClick={fetchTeacherData} className="bg-[#6096ba] hover:bg-[#274c77] text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#274c77] to-[#6096ba] rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mark Attendance</h1>
            <div className="flex items-center space-x-4 text-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{classInfo?.name} - {classInfo?.section}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isEditMode && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Edit3 className="h-4 w-4 mr-1" />
                Edit Mode
              </Badge>
            )}
            {!isDateEditable() && (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                <AlertCircle className="h-4 w-4 mr-1" />
                Read Only (Older than 7 days)
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Present</p>
                <p className="text-2xl font-bold">{presentCount}</p>
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
                <p className="text-2xl font-bold">{absentCount}</p>
              </div>
              <XCircle className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Leave</p>
                <p className="text-2xl font-bold">{leaveCount}</p>
              </div>
              <Calendar className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-[#274c77] to-[#6096ba] text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm opacity-90">{attendancePercentage}%</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#274c77]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={markAllPresent} 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!isDateEditable()}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
            <Button 
              onClick={markAllAbsent} 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-50"
              disabled={!isDateEditable()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark All Absent
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-[#6096ba] hover:bg-[#274c77] text-white"
              disabled={saving || !isDateEditable()}
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditMode ? 'Update Attendance' : 'Save Attendance'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#274c77]">Students List ({students.length} students)</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No students found in this class</p>
              <p className="text-gray-500 text-sm">Please contact administrator to add students to this classroom</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student Code</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          {student.photo ? (
                            <img 
                              src={student.photo} 
                              alt={student.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-[#6096ba] flex items-center justify-center text-white text-sm font-medium">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.student_code}</TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                            className={`${
                              attendance[student.id] === 'present' 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'border-green-500 text-green-500 hover:bg-green-50'
                            }`}
                            onClick={() => handleAttendanceChange(student.id, 'present')}
                            disabled={!isDateEditable()}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={attendance[student.id] === 'absent' ? 'default' : 'outline'}
                            className={`${
                              attendance[student.id] === 'absent' 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'border-red-500 text-red-500 hover:bg-red-50'
                            }`}
                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                            disabled={!isDateEditable()}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant={attendance[student.id] === 'leave' ? 'default' : 'outline'}
                            className={`${
                              attendance[student.id] === 'leave' 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'border-blue-500 text-blue-500 hover:bg-blue-50'
                            }`}
                            onClick={() => handleAttendanceChange(student.id, 'leave')}
                            disabled={!isDateEditable()}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Leave
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}