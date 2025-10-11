"use client";
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Save, RefreshCw, Edit3, History, TrendingUp } from "lucide-react";
import { getCurrentUserRole } from "@/lib/permissions";

type AttendanceStatus = "present" | "absent" | "leave" | "late" | "excused";

interface Student {
  id: number;
  name: string;
  grNo?: string;
  studentId?: string;
  gender: string;
  photo?: string;
}

interface ClassRoom {
  id: number;
  name: string;
  code: string;
  grade: { name: string };
  section: string;
  shift: string;
  campus?: { campusName: string };
  students: Student[];
}

export default function TeacherAttendancePageFallback() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [currentAttendance, setCurrentAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [attendanceRemarks, setAttendanceRemarks] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const userRole = getCurrentUserRole();

  // Mock data for testing
  const mockClasses: ClassRoom[] = [
    {
      id: 1,
      name: "Grade 10-A",
      code: "10A",
      grade: { name: "Grade 10" },
      section: "A",
      shift: "Morning",
      campus: { campusName: "Main Campus" },
      students: [
        { id: 1, name: "John Doe", grNo: "GR001", gender: "Male" },
        { id: 2, name: "Jane Smith", grNo: "GR002", gender: "Female" },
        { id: 3, name: "Mike Johnson", grNo: "GR003", gender: "Male" },
      ]
    }
  ];

  useEffect(() => {
    if (userRole === 'teacher') {
      document.title = "Mark Attendance | IAK SMS";
    }
  }, [userRole]);

  useEffect(() => {
    if (mockClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(mockClasses[0].id);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedClassId) {
      const selectedClass = mockClasses.find(cls => cls.id === selectedClassId);
      if (selectedClass) {
        setStudentsInClass(selectedClass.students);
      }
    }
  }, [selectedClassId]);

  const handleAttendanceChange = (studentId: number, status: AttendanceStatus) => {
    setCurrentAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleRemarksChange = (studentId: number, remarks: string) => {
    setAttendanceRemarks(prev => ({
      ...prev,
      [studentId]: remarks
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Attendance marked successfully! (This is a fallback version)');
      setIsLoading(false);
    }, 1000);
  };

  const markAllPresent = () => {
    const newAttendance: Record<number, AttendanceStatus> = {};
    studentsInClass.forEach(student => {
      newAttendance[student.id] = 'present';
    });
    setCurrentAttendance(newAttendance);
  };

  const markAllAbsent = () => {
    const newAttendance: Record<number, AttendanceStatus> = {};
    studentsInClass.forEach(student => {
      newAttendance[student.id] = 'absent';
    });
    setCurrentAttendance(newAttendance);
  };

  const selectedClassInfo = mockClasses.find(cls => cls.id === selectedClassId);
  const totalStudents = studentsInClass.length;
  const presentCount = Object.values(currentAttendance).filter(status => status === 'present').length;
  const absentCount = Object.values(currentAttendance).filter(status => status === 'absent').length;
  const lateCount = Object.values(currentAttendance).filter(status => status === 'late').length;
  const leaveCount = Object.values(currentAttendance).filter(status => status === 'leave').length;

  if (userRole !== 'teacher') {
    return (
      <div className="max-w-6xl mx-auto mt-12 p-10 bg-[#e7ecef] rounded-2xl shadow-2xl border-2 border-[#a3cef1]">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#274c77] mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">This page is only accessible to teachers.</p>
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
            <h1 className="text-3xl font-bold mb-2">Mark Attendance (Fallback Mode)</h1>
            <div className="flex items-center space-x-4 text-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <select
                  value={selectedClassId || ''}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                  className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {mockClasses.map((cls) => (
                    <option key={cls.id} value={cls.id} className="bg-[#274c77] text-white">
                      {cls.name} - {cls.section} ({cls.grade.name})
                    </option>
                  ))}
                </select>
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
            <div className="text-2xl font-bold">{totalStudents} Students</div>
            <div className="text-sm opacity-90">Total in Class</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Present</p>
                <p className="text-2xl font-bold text-green-700">{presentCount}</p>
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
                <p className="text-2xl font-bold text-red-700">{absentCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Late</p>
                <p className="text-2xl font-bold text-orange-700">{lateCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Leave</p>
                <p className="text-2xl font-bold text-yellow-700">{leaveCount}</p>
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
                <p className="text-2xl font-bold text-blue-700">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
            <Button
              onClick={markAllAbsent}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark All Absent
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
                    <TableHead className="font-bold text-[#274c77] text-center">Late</TableHead>
                    <TableHead className="font-bold text-[#274c77] text-center">Leave</TableHead>
                    <TableHead className="font-bold text-[#274c77] text-center">Remarks</TableHead>
                    <TableHead className="font-bold text-[#274c77] text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsInClass.map((student, index) => (
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
                              {student.grNo ? `GR# ${student.grNo}` : `ID: ${student.studentId || student.id}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      {['present', 'absent', 'late', 'leave'].map(statusOption => (
                        <TableCell key={statusOption} className="text-center">
                          <Button
                            type="button"
                            variant={currentAttendance[student.id] === statusOption ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleAttendanceChange(student.id, statusOption as AttendanceStatus)}
                            className={`w-16 ${
                              currentAttendance[student.id] === statusOption
                                ? `bg-${statusOption === 'present' ? 'green' : statusOption === 'absent' ? 'red' : statusOption === 'late' ? 'orange' : 'yellow'}-600 hover:bg-${statusOption === 'present' ? 'green' : statusOption === 'absent' ? 'red' : statusOption === 'late' ? 'orange' : 'yellow'}-700 text-white`
                                : `border-${statusOption === 'present' ? 'green' : statusOption === 'absent' ? 'red' : statusOption === 'late' ? 'orange' : 'yellow'}-500 text-${statusOption === 'present' ? 'green' : statusOption === 'absent' ? 'red' : statusOption === 'late' ? 'orange' : 'yellow'}-600 hover:bg-${statusOption === 'present' ? 'green' : statusOption === 'absent' ? 'red' : statusOption === 'late' ? 'orange' : 'yellow'}-50`
                            }`}
                            disabled={isLoading}
                          >
                            {statusOption === 'present' && <CheckCircle className="h-4 w-4" />}
                            {statusOption === 'absent' && <XCircle className="h-4 w-4" />}
                            {statusOption === 'late' && <Clock className="h-4 w-4" />}
                            {statusOption === 'leave' && <AlertCircle className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      ))}
                      <TableCell>
                        <input
                          type="text"
                          value={attendanceRemarks[student.id] || ''}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          placeholder="Remarks"
                          className="w-full p-2 border rounded-md"
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            currentAttendance[student.id] === 'present' ? 'default' :
                            currentAttendance[student.id] === 'absent' ? 'destructive' :
                            currentAttendance[student.id] === 'late' ? 'outline' :
                            currentAttendance[student.id] === 'leave' ? 'secondary' : 'outline'
                          }
                          className={
                            currentAttendance[student.id] === 'present' ? 'bg-green-100 text-green-800' :
                            currentAttendance[student.id] === 'absent' ? 'bg-red-100 text-red-800' :
                            currentAttendance[student.id] === 'late' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                            currentAttendance[student.id] === 'leave' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-gray-100 text-gray-600 border-gray-300'
                          }
                        >
                          {currentAttendance[student.id] ?
                            currentAttendance[student.id].charAt(0).toUpperCase() + currentAttendance[student.id].slice(1) :
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
                type="submit"
                disabled={isLoading || studentsInClass.length === 0}
                className="bg-[#6096ba] hover:bg-[#274c77] text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Attendance (Fallback Mode)
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notice */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Fallback Mode Active</h3>
              <p className="text-sm text-yellow-700">
                This is a temporary fallback version. Apollo Client is not properly installed yet. 
                Once GraphQL packages are installed, the full functionality will be available.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
