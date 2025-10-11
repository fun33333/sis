'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock, Save } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { MARK_ATTENDANCE } from '@/lib/graphql/mutations';

type AttendanceStatus = "present" | "absent" | "leave" | "late";

interface Student {
  id: number;
  name: string;
  student_code: string;
  photo?: string;
}

interface QuickAttendanceProps {
  students: Student[];
  classroomId: number;
  date: string;
  onSuccess?: () => void;
}

export function QuickAttendance({ students, classroomId, date, onSuccess }: QuickAttendanceProps) {
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);

  const [markAttendance] = useMutation(MARK_ATTENDANCE);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
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

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const studentAttendanceData = students.map(student => ({
        student_id: student.id,
        status: attendance[student.id] || 'absent',
        remarks: ''
      }));

      const result = await markAttendance({
        variables: {
          input: {
            classroom_id: classroomId,
            date: date,
            student_attendance: studentAttendanceData
          }
        }
      });

      if (result.data?.markAttendance?.success) {
        alert('Attendance marked successfully! 🎉');
        onSuccess?.();
      } else {
        throw new Error(result.data?.markAttendance?.message || 'Failed to mark attendance');
      }
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const leaveCount = Object.values(attendance).filter(s => s === 'leave').length;
  const lateCount = Object.values(attendance).filter(s => s === 'late').length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quick Attendance - {date}</span>
          <div className="flex space-x-2">
            <Button
              onClick={markAllPresent}
              variant="outline"
              size="sm"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              All Present
            </Button>
            <Button
              onClick={markAllAbsent}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              All Absent
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <div className="text-sm text-gray-600">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{leaveCount}</div>
            <div className="text-sm text-gray-600">Leave</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{lateCount}</div>
            <div className="text-sm text-gray-600">Late</div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {students.map((student) => {
            const currentStatus = attendance[student.id];
            
            return (
              <div
                key={student.id}
                className={`p-4 border rounded-lg transition-all ${
                  currentStatus === 'present' ? 'bg-green-50 border-green-200' :
                  currentStatus === 'absent' ? 'bg-red-50 border-red-200' :
                  currentStatus === 'leave' ? 'bg-yellow-50 border-yellow-200' :
                  currentStatus === 'late' ? 'bg-orange-50 border-orange-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.student_code}</div>
                    </div>
                  </div>
                  <Badge
                    variant={currentStatus ? 'default' : 'outline'}
                    className={
                      currentStatus === 'present' ? 'bg-green-100 text-green-800' :
                      currentStatus === 'absent' ? 'bg-red-100 text-red-800' :
                      currentStatus === 'leave' ? 'bg-yellow-100 text-yellow-800' :
                      currentStatus === 'late' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-600'
                    }
                  >
                    {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : 'Not Set'}
                  </Badge>
                </div>

                {/* Status Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={currentStatus === 'present' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`text-xs ${
                      currentStatus === 'present'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'border-green-500 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Present
                  </Button>
                  <Button
                    size="sm"
                    variant={currentStatus === 'absent' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`text-xs ${
                      currentStatus === 'absent'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'border-red-500 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Absent
                  </Button>
                  <Button
                    size="sm"
                    variant={currentStatus === 'leave' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(student.id, 'leave')}
                    className={`text-xs ${
                      currentStatus === 'leave'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                    }`}
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Leave
                  </Button>
                  <Button
                    size="sm"
                    variant={currentStatus === 'late' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`text-xs ${
                      currentStatus === 'late'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'border-orange-500 text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Late
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={loading || Object.keys(attendance).length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
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
      </CardContent>
    </Card>
  );
}


