"use client";
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Save, RefreshCw } from "lucide-react";
import { getCurrentUserProfile, getClassroomStudents } from "@/lib/api";
import { getCurrentUserRole } from "@/lib/permissions";

type AttendanceStatus = "present" | "absent" | "leave";

interface Student {
  id: number;
  name: string;
  gr_no?: string;
  student_id?: string;
  gender: string;
  photo?: string;
}

interface AttendanceRecord {
  student_id: number;
  status: AttendanceStatus;
  date: string;
  remarks?: string;
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [classInfo, setClassInfo] = useState({
    name: "",
    section: "",
    totalStudents: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    leave: 0,
    total: 0
  });
  const [showUnmarkedAlert, setShowUnmarkedAlert] = useState(false);

  useEffect(() => {
    const role = getCurrentUserRole()
    if (role === 'teacher') {
      document.title = "Mark Attendance | IAK SMS";
    }
  }, []);

  useEffect(() => {
    fetchClassData();
  }, []);

  useEffect(() => {
    // Update attendance stats when attendance changes
    const stats = {
      present: Object.values(attendance).filter(status => status === 'present').length,
      absent: Object.values(attendance).filter(status => status === 'absent').length,
      leave: Object.values(attendance).filter(status => status === 'leave').length,
      total: students.length
    };
    setAttendanceStats(stats);
    
    // Check for unmarked students
    const markedCount = Object.values(attendance).filter(status => status !== undefined && status !== null).length;
    const unmarkedCount = students.length - markedCount;
    setShowUnmarkedAlert(unmarkedCount > 0 && markedCount > 0); // Show alert only if some are marked but some are not
  }, [attendance, students]);

  async function fetchClassData() {
    try {
      setLoading(true);
      setError("");
      
      const role = getCurrentUserRole();
      if (role === 'teacher') {
        // Get teacher's classroom data
        const teacherProfile = await getCurrentUserProfile() as any;
        if (teacherProfile?.assigned_classroom?.id) {
          const classroomData = await getClassroomStudents(teacherProfile.assigned_classroom.id, teacherProfile.teacher_id) as any;
          const studentsData = classroomData.students || [];
          
          setClassInfo({
            name: teacherProfile.assigned_classroom.name || "Unknown Class",
            section: teacherProfile.assigned_classroom.section || "",
            totalStudents: studentsData.length
          });
          
          setStudents(studentsData.map((s: any) => ({
            id: s.id,
            name: s.name,
            gr_no: s.gr_no,
            student_id: s.student_id,
            gender: s.gender,
            photo: s.photo
          })));
          
          // Initialize attendance with no students marked by default
          const initialAttendance: Record<number, AttendanceStatus> = {};
          // Don't set any default attendance - let teacher mark manually
          setAttendance(initialAttendance);
        } else {
          setError("No classroom assigned to you. Please contact administrator.");
        }
      } else {
        setError("Access denied. This page is only for teachers.");
      }
    } catch (err: any) {
      console.error('Error fetching class data:', err);
      setError("Failed to load class data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleAttendanceChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
    try {
      setSaving(true);
      
      // Check if any attendance is marked
      const markedStudents = Object.values(attendance).filter(status => status !== undefined && status !== null);
      if (markedStudents.length === 0) {
        alert('Please mark attendance for at least one student before submitting.');
        setSaving(false);
        return;
      }
      
      // Check if all students are marked
      const unmarkedStudents = getUnmarkedStudents();
      if (unmarkedStudents.length > 0) {
        const confirmSubmit = confirm(
          `You have not marked attendance for ${unmarkedStudents.length} student(s):\n` +
          `${unmarkedStudents.slice(0, 3).map(s => s.name).join(', ')}${unmarkedStudents.length > 3 ? '...' : ''}\n\n` +
          'Do you want to submit attendance for only the marked students?'
        );
        if (!confirmSubmit) {
          setSaving(false);
          return;
        }
      }
      
      // Prepare attendance data
      const attendanceData: AttendanceRecord[] = Object.entries(attendance)
        .filter(([_, status]) => status !== undefined && status !== null)
        .map(([studentId, status]) => ({
          student_id: parseInt(studentId),
          status: status!,
          date: selectedDate
        }));
      
      // TODO: Send to backend API
      console.log('Attendance data to submit:', attendanceData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Attendance marked successfully for ${selectedDate}!\nPresent: ${attendanceStats.present}, Absent: ${attendanceStats.absent}, Leave: ${attendanceStats.leave}`);
      
    } catch (err: any) {
      console.error('Error submitting attendance:', err);
      alert('Failed to submit attendance. Please try again.');
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

  const getUnmarkedStudents = () => {
    return students.filter(student => !attendance[student.id] || attendance[student.id] === null || attendance[student.id] === undefined);
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
            <Button onClick={fetchClassData} className="bg-[#6096ba] hover:bg-[#274c77] text-white">
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
                <span>{classInfo.name} - {classInfo.section}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{classInfo.totalStudents} Students</div>
            <div className="text-sm opacity-90">Total in Class</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Present</p>
                <p className="text-2xl font-bold text-green-700">{attendanceStats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Absent</p>
                <p className="text-2xl font-bold text-red-700">{attendanceStats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Leave</p>
                <p className="text-2xl font-bold text-yellow-700">{attendanceStats.leave}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-700">{attendanceStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unmarked Students Alert */}
      {showUnmarkedAlert && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Unmarked Students Reminder</h3>
                <p className="text-yellow-700 mb-3">
                  You have marked attendance for some students but missed {getUnmarkedStudents().length} student(s). 
                  Please mark attendance for all students before submitting.
                </p>
                <div className="flex flex-wrap gap-2">
                  {getUnmarkedStudents().slice(0, 5).map((student) => (
                    <Badge key={student.id} variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {student.name}
                    </Badge>
                  ))}
                  {getUnmarkedStudents().length > 5 && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      +{getUnmarkedStudents().length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowUnmarkedAlert(false)}
                variant="ghost"
                size="sm"
                className="text-yellow-600 hover:text-yellow-800"
              >
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#274c77] flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={markAllPresent}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
            <Button
              onClick={markAllAbsent}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark All Absent
            </Button>
            <Button
              onClick={fetchClassData}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#274c77]">Student Attendance</CardTitle>
        </CardHeader>
        <CardContent>
			<form onSubmit={handleSubmit}>
				<div className="overflow-x-auto">
              <Table className="w-full">
						<TableHeader>
                  <TableRow className="bg-[#f8f9fa]">
                    <TableHead className="font-bold text-[#274c77]">#</TableHead>
                    <TableHead className="font-bold text-[#274c77]">Student</TableHead>
                    <TableHead className="font-bold text-[#274c77] text-center">Present</TableHead>
                    <TableHead className="font-bold text-[#274c77] text-center">Absent</TableHead>
                    <TableHead className="font-bold text-[#274c77] text-center">Leave</TableHead>
                    <TableHead className="font-bold text-[#274c77] text-center">Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-600">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-[#6096ba] flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-[#274c77]">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              {student.gr_no ? `GR# ${student.gr_no}` : `ID: ${student.student_id || student.id}`}
                            </div>
                          </div>
										</div>
									</TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAttendanceChange(student.id, 'present')}
                          className={`w-16 ${
                            attendance[student.id] === 'present'
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'border-green-500 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant={attendance[student.id] === 'absent' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAttendanceChange(student.id, 'absent')}
                          className={`w-16 ${
                            attendance[student.id] === 'absent'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'border-red-500 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant={attendance[student.id] === 'leave' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAttendanceChange(student.id, 'leave')}
                          className={`w-16 ${
                            attendance[student.id] === 'leave'
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                          }`}
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
									</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            attendance[student.id] === 'present' ? 'default' :
                            attendance[student.id] === 'absent' ? 'destructive' : 
                            attendance[student.id] === 'leave' ? 'secondary' : 'outline'
                          }
                          className={
                            attendance[student.id] === 'present' ? 'bg-green-100 text-green-800' :
                            attendance[student.id] === 'absent' ? 'bg-red-100 text-red-800' :
                            attendance[student.id] === 'leave' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-600 border-gray-300'
                          }
                        >
                          {attendance[student.id] ? 
                            attendance[student.id].charAt(0).toUpperCase() + attendance[student.id].slice(1) : 
                            'Not Set'
                          }
                        </Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={fetchClassData}
                disabled={saving}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                type="submit"
                disabled={saving || students.length === 0 || Object.values(attendance).filter(status => status !== undefined && status !== null).length === 0}
                className="bg-[#6096ba] hover:bg-[#274c77] text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Attendance
                  </>
                )}
              </Button>
				</div>
			</form>
        </CardContent>
      </Card>
		</div>
	);
}
