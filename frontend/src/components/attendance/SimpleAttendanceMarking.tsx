import React, { useState, useEffect } from 'react';

interface Student {
  id: number;
  name: string;
  student_code: string;
  photo?: string;
  gr_no?: string;
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

const SimpleAttendanceMarking: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [presentStudents, setPresentStudents] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Load teacher's classes on component mount
  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchTeacherClasses = async () => {
    try {
      const response = await fetch('/api/attendance/teacher/classes/');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchClassStudents = async (classroomId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance/class/${classroomId}/students/`);
      const data = await response.json();
      setStudents(data);
      setPresentStudents([]); // Reset present students
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentPresence = (studentId: number) => {
    setPresentStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const markAllPresent = () => {
    const allStudentIds = students.map(student => student.id);
    setPresentStudents(allStudentIds);
  };

  const markAllAbsent = () => {
    setPresentStudents([]);
  };

  const submitAttendance = async () => {
    if (!selectedClass) {
      alert('Please select a class first!');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/attendance/mark-bulk/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classroom_id: selectedClass,
          date: selectedDate,
          present_students: presentStudents
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Attendance marked successfully! 🎉\nPresent: ${result.present_count}/${result.total_students} (${result.attendance_percentage}%)`);
      } else {
        throw new Error('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance');
    } finally {
      setLoading(false);
    }
  };

  const selectedClassInfo = classes.find(cls => cls.id === selectedClass);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Mark Class Attendance 📝
      </h2>
      
      {/* Class and Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            value={selectedClass || ''}
            onChange={(e) => setSelectedClass(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a class...</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.shift}) - {cls.campus}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Class Info */}
      {selectedClassInfo && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            {selectedClassInfo.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-700">
            <div><strong>Code:</strong> {selectedClassInfo.code}</div>
            <div><strong>Grade:</strong> {selectedClassInfo.grade}</div>
            <div><strong>Section:</strong> {selectedClassInfo.section}</div>
            <div><strong>Shift:</strong> {selectedClassInfo.shift}</div>
          </div>
        </div>
      )}

      {/* Students List */}
      {students.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">
              Students ({students.length})
            </h3>
            <div className="space-x-2">
              <button
                onClick={markAllPresent}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Mark All Present ✅
              </button>
              <button
                onClick={markAllAbsent}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Mark All Absent ❌
              </button>
            </div>
          </div>
          
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {students.map((student) => {
              const isPresent = presentStudents.includes(student.id);
              
              return (
                <div 
                  key={student.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    isPresent 
                      ? 'bg-green-50 border-green-300 hover:bg-green-100' 
                      : 'bg-red-50 border-red-300 hover:bg-red-100'
                  }`}
                  onClick={() => toggleStudentPresence(student.id)}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={student.photo || '/default-avatar.png'}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-500">
                        {student.student_code} {student.gr_no && `• GR: ${student.gr_no}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isPresent 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-white border-red-500 text-red-500'
                    }`}>
                      {isPresent && '✓'}
                    </div>
                    <span className={`text-sm font-medium ${
                      isPresent ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {isPresent ? 'Present' : 'Absent'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">{students.length}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{presentStudents.length}</div>
                <div className="text-sm text-gray-600">Present</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{students.length - presentStudents.length}</div>
                <div className="text-sm text-gray-600">Absent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {students.length > 0 ? Math.round((presentStudents.length / students.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Attendance</div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={submitAttendance}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Attendance 💾'}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default SimpleAttendanceMarking;

