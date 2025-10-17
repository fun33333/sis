"use client";
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Save, RefreshCw, Edit3, History, Eraser, Send, Clock3, Bell, Eye, ChevronDown, EyeOff } from "lucide-react";
import { getCurrentUserRole } from "@/lib/permissions";
import { getCurrentUserProfile, getClassStudents, markBulkAttendance, getAttendanceHistory, getAttendanceForDate, editAttendance, submitAttendance, getBackfillPermissions, finalizeAttendance, reviewAttendance } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
// import AttendanceStateControls from "@/components/attendance/attendance-state-controls";
// import BackfillPermission from "@/components/attendance/backfill-permission";

type AttendanceStatus = "present" | "absent" | "leave";

interface Student {
  id: number;
  name: string;
  student_code: string;
  student_id?: string;
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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showBackfillModal, setShowBackfillModal] = useState(false);
  const [backfillPermissions, setBackfillPermissions] = useState<any[]>([]);
  const [hasNewPermissions, setHasNewPermissions] = useState(false);
  const [last6DaysAttendance, setLast6DaysAttendance] = useState<any[]>([]);
  const [loadingLast6Days, setLoadingLast6Days] = useState(false);
  const [expandedAttendance, setExpandedAttendance] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const userRole = getCurrentUserRole();
  const classroomId = searchParams.get('classroom');

  useEffect(() => {
    if (userRole === 'teacher') {
      document.title = "Mark Attendance | IAK SMS";
      fetchTeacherData();
      fetchBackfillPermissions();
    } else if (userRole === 'coordinator' && classroomId) {
      document.title = "View Attendance | IAK SMS";
      fetchCoordinatorClassData();
      fetchLast6DaysAttendance();
    }
  }, [userRole, classroomId]);

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
        // Store the attendance ID but don't load the data automatically
        setExistingAttendanceId(attendanceData.id);
        setAttendance({}); // Keep sheet blank
        setIsEditMode(false); // Not in edit mode initially
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

  const handleSubmit = () => {
    // Check if attendance already exists for this date
    if (!isEditMode && existingAttendanceId) {
      alert('⚠️ Attendance Already Marked!\n\nYou have already marked attendance for this date.\n\nTo edit previous attendance, please click "Load Saved Attendance" button first.');
      return;
    }
    
    // Show confirmation modal instead of directly submitting
    setShowConfirmationModal(true);
  };

  const confirmSubmit = async () => {
    if (!classInfo) return;

    try {
      setSaving(true);
      setShowConfirmationModal(false);
      
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
        result = await markBulkAttendance({
          classroom_id: classInfo.id,
          date: selectedDate,
          student_attendance: studentAttendanceData
        });
      }

      alert(`✅ Attendance ${isEditMode ? 'Updated' : 'Marked'} Successfully!\n\n${isEditMode ? 'Your changes have been saved.' : 'Attendance has been recorded for this date.'}`);
      
      // Reset the sheet to blank after successful save
      setAttendance({});
      setIsEditMode(false);
      
      // Set existingAttendanceId for future loads
      if (result && (result as any).attendance_id) {
        setExistingAttendanceId((result as any).attendance_id);
      } else if (result && (result as any).id) {
        setExistingAttendanceId((result as any).id);
      } else if (result && (result as any).data && (result as any).data.id) {
        setExistingAttendanceId((result as any).data.id);
      }
      
    } catch (err: unknown) {
      console.error('Error marking attendance:', err);
      alert(`❌ Failed to ${isEditMode ? 'Update' : 'Mark'} Attendance!\n\nPlease check your internet connection and try again.\n\nIf the problem persists, contact the administrator.`);
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

  const clearAllAttendance = () => {
    setAttendance({});
  };


  const handleSubmitForReview = async () => {
    if (!existingAttendanceId) return;
    
    try {
      setSubmitting(true);
      await submitAttendance(existingAttendanceId);
      alert('✅ Attendance submitted for review successfully!');
      // Refresh data
      fetchTeacherData();
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('❌ Failed to submit attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchBackfillPermissions = async () => {
    try {
      const permissions = await getBackfillPermissions() as any[];
      setBackfillPermissions(permissions);
      // Check if there are any new permissions (not used)
      const newPermissions = permissions.filter((p: any) => !p.is_used);
      setHasNewPermissions(newPermissions.length > 0);
    } catch (error) {
      console.error('Error fetching backfill permissions:', error);
    }
  };

  const handleBackfillIconClick = () => {
    setShowBackfillModal(true);
    fetchBackfillPermissions();
  };

  const fetchCoordinatorClassData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!classroomId) {
        setError("No classroom specified");
        return;
      }

      // Get classroom info directly from classrooms API
      const classroomResponse = await fetch(`/api/classrooms/${classroomId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      let classroomData = null;
      if (classroomResponse.ok) {
        classroomData = await classroomResponse.json();
        console.log('🏫 Classroom data:', classroomData);
        console.log('🏫 Classroom code:', classroomData.code);
        console.log('🏫 Classroom name:', classroomData.name);
      } else {
        console.log('❌ Classroom API failed with status:', classroomResponse.status);
      }

      // Get students and attendance history
      const [classStudents, attendanceHistory] = await Promise.all([
        getClassStudents(parseInt(classroomId)),
        getAttendanceHistory(parseInt(classroomId))
      ]);

      // Set classroom info from API or fallback
      if (classroomData) {
        console.log('🏫 Using classroom data from API');
        console.log('🏫 Classroom code from API:', classroomData.code);
        setClassInfo({
          id: classroomData.id,
          name: classroomData.name || `Classroom ${classroomId}`,
          code: classroomData.code || `C06-L2-G03-A`, // Use real code, fallback to A
          grade: classroomData.grade?.name || '',
          section: classroomData.section || '',
          shift: classroomData.shift || '',
          campus: classroomData.campus?.campus_name || ''
        });
      } else if (classStudents && Array.isArray(classStudents) && classStudents.length > 0) {
        // Fallback: Extract from first student
        const firstStudent = classStudents[0] as any;
        console.log('🔍 First student data (fallback):', firstStudent);
        console.log('🔍 Classroom code from student:', firstStudent.classroom_code);
        
        setClassInfo({
          id: parseInt(classroomId),
          name: firstStudent.classroom_name || `Classroom ${classroomId}`,
          code: firstStudent.classroom_code || `C06-L2-G03-A`, // Use real code, fallback to A
          grade: firstStudent.grade || '',
          section: firstStudent.section || '',
          shift: firstStudent.shift || '',
          campus: firstStudent.campus_name || ''
        });
      } else {
        // Final fallback with default code
        console.log('🔍 Using final fallback with default code');
        setClassInfo({
          id: parseInt(classroomId),
          name: `Classroom ${classroomId}`,
          code: `C06-L2-G03-A`, // Default to A
          grade: '',
          section: '',
          shift: '',
          campus: ''
        });
      }

      if (classStudents && Array.isArray(classStudents)) {
        setStudents(classStudents as Student[]);
      }

      if (attendanceHistory && Array.isArray(attendanceHistory) && attendanceHistory.length > 0) {
        setLast6DaysAttendance(attendanceHistory as any[]);
      }
      
    } catch (error) {
      console.error('Error fetching coordinator class data:', error);
      setError('Failed to load classroom data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLast6DaysAttendance = async () => {
    try {
      setLoadingLast6Days(true);
      
      if (!classroomId) return;

      // Get last 6 days
      const today = new Date();
      const sixDaysAgo = new Date(today);
      sixDaysAgo.setDate(today.getDate() - 6);

      console.log('🔍 Fetching attendance for classroom:', classroomId);
      console.log('📅 Date range:', sixDaysAgo.toISOString().split('T')[0], 'to', today.toISOString().split('T')[0]);

      const attendanceData = await getAttendanceHistory(
        parseInt(classroomId),
        sixDaysAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );

      console.log('📊 Raw attendance data:', attendanceData);
      console.log('📊 Attendance data type:', typeof attendanceData);
      console.log('📊 Attendance data length:', Array.isArray(attendanceData) ? attendanceData.length : 'Not an array');

      if (Array.isArray(attendanceData) && attendanceData.length > 0) {
        console.log('👥 First record student_attendance:', attendanceData[0].student_attendance);
        console.log('👥 Student attendance type:', typeof attendanceData[0].student_attendance);
        console.log('👥 Student attendance length:', Array.isArray(attendanceData[0].student_attendance) ? attendanceData[0].student_attendance.length : 'Not an array');
      }

      setLast6DaysAttendance((attendanceData as any[]) || []);
    } catch (error) {
      console.error('Error fetching last 6 days attendance:', error);
    } finally {
      setLoadingLast6Days(false);
    }
  };

  const handleApproveAttendance = async (attendanceId: number) => {
    try {
      console.log('Approving attendance:', attendanceId);
      
      // First check the current status and handle accordingly
      const attendanceRecord = last6DaysAttendance.find(record => record.id === attendanceId);
      
      if (!attendanceRecord) {
        alert('Attendance record not found!');
        return;
      }
      
      console.log('Current status:', attendanceRecord.status);
      
      // If status is 'draft', first submit it
      if (attendanceRecord.status === 'draft') {
        console.log('Submitting attendance first...');
        await submitAttendance(attendanceId);
        console.log('Attendance submitted successfully');
        
        // Wait a moment then finalize
        await new Promise(resolve => setTimeout(resolve, 500));
        await finalizeAttendance(attendanceId);
        console.log('Attendance finalized successfully');
        
        alert('Attendance submitted and approved successfully!');
      } 
      // If status is 'submitted', move to under_review then finalize
      else if (attendanceRecord.status === 'submitted') {
        console.log('Reviewing attendance...');
        await reviewAttendance(attendanceId);
        console.log('Attendance reviewed successfully');
        
        // Wait a moment then finalize
        await new Promise(resolve => setTimeout(resolve, 500));
        await finalizeAttendance(attendanceId);
        console.log('Attendance finalized successfully');
        
        alert('Attendance reviewed and approved successfully!');
      }
      // If status is 'under_review', just finalize
      else if (attendanceRecord.status === 'under_review') {
        await finalizeAttendance(attendanceId);
        console.log('Attendance finalized successfully');
        
        alert('Attendance approved successfully!');
      }
      // If already final, show message
      else if (attendanceRecord.status === 'final') {
        alert('Attendance is already approved!');
        return;
      }
      
      // Refresh the data
      await fetchLast6DaysAttendance();
      
    } catch (error) {
      console.error('Error approving attendance:', error);
      alert('Error approving attendance. Please try again.');
    }
  };

  const toggleAttendanceExpansion = (attendanceId: number) => {
    setExpandedAttendance(expandedAttendance === attendanceId ? null : attendanceId);
  };


  const loadSavedAttendance = async () => {
    if (!classInfo) return;
    
    try {
      setLoading(true);
      const attendanceData = await getAttendanceForDate(classInfo.id, selectedDate) as any;
      
      if (attendanceData && attendanceData.id) {
        const existingAttendance: Record<number, AttendanceStatus> = {};
        attendanceData.student_attendance.forEach((record: any) => {
          existingAttendance[record.student_id] = record.status;
        });
        setAttendance(existingAttendance);
        setIsEditMode(true);
        setExistingAttendanceId(attendanceData.id);
        alert('Saved attendance loaded successfully! You can now make changes and update.');
      } else {
        alert('No saved attendance found for this date.');
      }
    } catch (error: unknown) {
      console.error('Error loading saved attendance:', error);
      alert('Failed to load saved attendance. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <span className="text-[#274c77] font-medium">Loading...</span>
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

  // Coordinator view - Last 6 days attendance
  if (userRole === 'coordinator' && classroomId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Attendance Review</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {classInfo?.code || classInfo?.name || `Classroom ${classroomId}`} • Last 6 Days
                  </p>
                </div>
                <Button 
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          </div>


        {/* Detailed Attendance Sheets */}
        {last6DaysAttendance.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="col-span-3">Date & Status</div>
                <div className="col-span-2">Marked By</div>
                <div className="col-span-2">Students</div>
                <div className="col-span-3">Attendance</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {last6DaysAttendance.map((record: any, index: number) => (
                <div key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  {/* Main Row */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-12 gap-4 items-center min-h-[80px]">
                      {/* Date & Status */}
                      <div className="col-span-3 flex items-center">
                        <div className="flex items-center space-x-3 w-full">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex flex-col space-y-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                            <Badge 
                              variant="outline"
                              className={`w-fit ${
                                record.status === 'final' ? 'bg-green-50 text-green-700 border-green-200' :
                                record.status === 'submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                record.status === 'under_review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              {record.status?.charAt(0).toUpperCase() + record.status?.slice(1) || 'Draft'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Marked By */}
                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center space-x-2 w-full">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-sm text-gray-900 truncate">{record.marked_by_name || 'Unknown'}</span>
                        </div>
                      </div>

                      {/* Students Count */}
                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center space-x-2 w-full">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{record.total_students || 0}</span>
                        </div>
                      </div>

                      {/* Attendance Stats */}
                      <div className="col-span-3 flex items-center">
                        <div className="flex items-center space-x-4 w-full">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                            <span className="text-sm text-gray-600">{record.present_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                            <span className="text-sm text-gray-600">{record.absent_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                            <span className="text-sm text-gray-600">{record.leave_count || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end">
                        <div className="flex items-center space-x-1">
                          <Button
                            onClick={() => toggleAttendanceExpansion(record.id)}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-2 py-1"
                          >
                            {expandedAttendance === record.id ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </>
                            )}
                          </Button>
                          
                          {/* Approved Button - Show only for non-final statuses */}
                          {record.status !== 'final' && (
                            <Button
                              onClick={() => handleApproveAttendance(record.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          )}
                          
                          {/* Approved Badge - Show only for final status */}
                          {record.status === 'final' && (
                            <Badge 
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Content with Smooth Animation */}
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      expandedAttendance === record.id 
                        ? 'max-h-[800px] opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      {/* Student Table */}
                      {record.student_attendance && Array.isArray(record.student_attendance) && record.student_attendance.length > 0 ? (
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-gray-200 rounded-lg bg-white">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {record.student_attendance.map((studentRecord: any, studentIndex: number) => (
                                <tr key={studentIndex} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-600">
                                          {studentRecord.student_name?.charAt(0).toUpperCase() || 'S'}
                                        </span>
                                      </div>
                                      <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">
                                          {studentRecord.student_name || 'Unknown Student'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {studentRecord.student_code || studentRecord.student_id || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <Badge 
                                      variant="outline"
                                      className={
                                        studentRecord.student_gender === 'male' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        studentRecord.student_gender === 'female' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                        'bg-gray-50 text-gray-700 border-gray-200'
                                      }
                                    >
                                      {studentRecord.student_gender?.charAt(0).toUpperCase() + studentRecord.student_gender?.slice(1) || 'N/A'}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <Badge 
                                      variant="outline"
                                      className={
                                        studentRecord.status === 'present' ? 'bg-green-50 text-green-700 border-green-200' :
                                        studentRecord.status === 'absent' ? 'bg-red-50 text-red-700 border-red-200' :
                                        studentRecord.status === 'leave' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-gray-50 text-gray-700 border-gray-200'
                                      }
                                    >
                                      {studentRecord.status?.charAt(0).toUpperCase() + studentRecord.status?.slice(1) || 'Unknown'}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <Users className="h-12 w-12 mx-auto" />
                          </div>
                          <p className="text-gray-500 text-sm">No student records found for this date</p>
                          <p className="text-gray-400 text-xs mt-1">Please check if attendance was marked for this classroom</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
            {/* Backfill Permissions Icon */}
            <div className="relative">
              <Button
                onClick={handleBackfillIconClick}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 flex items-center gap-2"
                size="sm"
              >
                <Clock3 className="h-4 w-4" />
                Backfill
              </Button>
              {hasNewPermissions && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <Bell className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
            
            {existingAttendanceId && (
              <Button
                onClick={handleSubmitForReview}
                disabled={submitting}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}
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


      {/* Backfill Permissions Modal */}
      <Dialog open={showBackfillModal} onOpenChange={setShowBackfillModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5" />
              Backfill Permissions
            </DialogTitle>
            <DialogDescription>
              View and manage your backfill permissions for missed attendance dates.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {backfillPermissions.length === 0 ? (
              <div className="text-center py-8">
                <Clock3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No backfill permissions found</p>
                <p className="text-gray-400 text-sm">Contact your coordinator for backfill permissions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backfillPermissions.map((permission: any, index: number) => (
                  <Card key={index} className={`${!permission.is_used ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {permission.classroom?.name || 'Unknown Class'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(permission.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Deadline: {new Date(permission.deadline).toLocaleString()}
                          </p>
                          {permission.reason && (
                            <p className="text-sm text-gray-500 mt-1">
                              Reason: {permission.reason}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {permission.is_used ? (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600">
                              Used
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200">
                              Available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackfillModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={clearAllAttendance}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
              disabled={!isDateEditable()}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            {/* Smart Button Logic */}
            {existingAttendanceId && !isEditMode ? (
              // Show Load button when attendance exists but not in edit mode
              <Button
                onClick={loadSavedAttendance}
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
                disabled={loading || !isDateEditable()}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Edit3 className="h-4 w-4 mr-2" />
                )}
                Load Saved Attendance
              </Button>
            ) : (
              // Show Save/Update button when no attendance exists or in edit mode
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
            )}
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
                    <TableHead>Student ID</TableHead>
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
                      <TableCell>{student.student_id || student.student_code || 'Not Assigned'}</TableCell>
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

      {/* Confirmation Modal */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#274c77] text-xl font-bold">
              Confirm Attendance
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to {isEditMode ? 'update' : 'mark'} attendance for {classInfo?.name} on {selectedDate}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Present Count */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                <div className="text-sm text-green-600 font-medium">Present</div>
              </div>

              {/* Absent Count */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                <div className="text-sm text-red-600 font-medium">Absent</div>
              </div>

              {/* Leave Count */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-700">{leaveCount}</div>
                <div className="text-sm text-blue-600 font-medium">Leave</div>
              </div>

              {/* Total Count */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-700">{totalStudents}</div>
                <div className="text-sm text-gray-600 font-medium">Total</div>
              </div>
            </div>

            {/* Attendance Percentage */}
            <div className="mt-4 bg-[#274c77] text-white rounded-lg p-3 text-center">
              <div className="text-lg font-semibold">
                Attendance: {attendancePercentage}%
              </div>
              <div className="text-sm opacity-90">
                {presentCount} out of {totalStudents} students
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmationModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmSubmit}
              className="bg-[#6096ba] hover:bg-[#274c77] text-white"
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Attendance' : 'Save Attendance'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

		</div>
	);
}