"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Users, 
  BookOpen, 
  Award,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  Send
} from "lucide-react";
import { 
  getClassroomStudents, 
  getCurrentUserProfile,
  createResult,
  getMyResults,
  checkMidTerm,
  submitResult,
  getAllStudents,
  getTeacherStudents,
  ResultData,
  Result,
  SubjectMark,
  Student
} from "@/lib/api";
import { toast } from "sonner";

const SUBJECTS = [
  { name: 'urdu', display: 'Urdu', has_practical: true, practical_name: 'Urdu Oral' },
  { name: 'english', display: 'English', has_practical: true, practical_name: 'English Oral' },
  { name: 'mathematics', display: 'Mathematics', has_practical: false },
  { name: 'science', display: 'Science', has_practical: false },
  { name: 'social_studies', display: 'Social Studies', has_practical: false },
  { name: 'islamiat', display: 'Islamiat', has_practical: false },
  { name: 'computer_science', display: 'Computer Science', has_practical: false },
];

const EXAM_TYPES = [
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'final_term', label: 'Final Term' },
];

export default function TeacherResultPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  
  // Ensure results is always an array
  const safeResults = Array.isArray(results) ? results : [];
  
  // Form states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [examType, setExamType] = useState<'mid_term' | 'final_term'>('mid_term');
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [midTermCheck, setMidTermCheck] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Clear cache to ensure fresh data for each teacher
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cache_students');
        localStorage.removeItem('cache_teacher_profile');
      }
      
      // Get teacher profile
      const profile = await getCurrentUserProfile();
      console.log('👨‍🏫 Teacher profile:', profile);
      setTeacherProfile(profile as any);
      
      // Always fetch students - getTeacherStudents has automatic teacher filtering
      const studentsData = await getTeacherStudents();
      console.log('📊 Students data from API:', studentsData);
      console.log('👥 Students data type:', typeof studentsData);
      console.log('👥 Is array?', Array.isArray(studentsData));
      console.log('👥 Students length:', studentsData?.length);
      console.log('👥 First student:', studentsData?.[0]);
      setStudents(studentsData as Student[]);
        
        // Fetch existing results
        const resultsData = await getMyResults();
      // Ensure results is always an array
      const resultsArray = Array.isArray(resultsData) ? resultsData : ((resultsData as any)?.results || []);
      setResults(resultsArray as Result[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const initializeSubjectMarks = () => {
    const marks: SubjectMark[] = SUBJECTS.map(subject => ({
      subject_name: subject.name,
      total_marks: 100,
      obtained_marks: 0,
      has_practical: subject.has_practical,
      practical_total: subject.has_practical ? 20 : 0,
      practical_obtained: 0,
      is_pass: false
    }));
    setSubjectMarks(marks);
  };

  const handleStudentChange = async (studentId: string) => {
    const student = students.find(s => s.id === parseInt(studentId));
    setSelectedStudent(student || null);
    
    if (student) {
      initializeSubjectMarks();
      
      // Check mid-term if final term is selected
      if (examType === 'final_term') {
        try {
          const check = await checkMidTerm(student.id);
          setMidTermCheck(check);
          
          if (!check.mid_term_approved) {
            toast.error('Mid-term result must be approved before creating final-term result');
            setExamType('mid_term');
          }
        } catch (error) {
          console.error('Error checking mid-term:', error);
        }
      }
    }
  };

  const handleExamTypeChange = async (type: 'mid_term' | 'final_term') => {
    setExamType(type);
    
    if (type === 'final_term' && selectedStudent) {
      try {
        const check = await checkMidTerm(selectedStudent.id);
        setMidTermCheck(check);
        
        if (!check.mid_term_approved) {
          toast.error('Mid-term result must be approved before creating final-term result');
          setExamType('mid_term');
          return;
        }
      } catch (error) {
        console.error('Error checking mid-term:', error);
      }
    }
  };

  const handleMarkChange = (subjectName: string, field: string, value: number) => {
    setSubjectMarks(prev => prev.map(mark => {
      if (mark.subject_name === subjectName) {
        const updated = { ...mark, [field]: value };
        
        // Calculate pass/fail
        const isTheoryPass = examType === 'mid_term' ? updated.obtained_marks >= 33 : updated.obtained_marks >= 40;
        const isPracticalPass = !updated.has_practical || 
          (examType === 'mid_term' ? (updated.practical_obtained || 0) >= 7 : (updated.practical_obtained || 0) >= 8);
        
        updated.is_pass = isTheoryPass && isPracticalPass;
        
        return updated;
      }
      return mark;
    }));
  };

  const calculateTotals = () => {
    const totalMarks = subjectMarks.reduce((sum, mark) => {
      return sum + mark.total_marks + (mark.practical_total || 0);
    }, 0);
    
    const obtainedMarks = subjectMarks.reduce((sum, mark) => {
      return sum + mark.obtained_marks + (mark.practical_obtained || 0);
    }, 0);
    
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const allSubjectsPass = subjectMarks.every(mark => mark.is_pass);
    const overallPass = allSubjectsPass && percentage >= 50;
    
    return { totalMarks, obtainedMarks, percentage, overallPass };
  };

  const handleCreateResult = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    // Allow both pass and fail results to be created
    // const { overallPass } = calculateTotals();
    // if (!overallPass) {
    //   toast.error('Student must pass all subjects to create result');
    //   return;
    // }

    try {
      setCreating(true);
      
      const resultData: ResultData = {
        student: selectedStudent.id,
        exam_type: examType,
        academic_year: '2024-25',
        semester: 'Spring',
        subject_marks: subjectMarks
      };
      
      await createResult(resultData);
      
      toast.success('Result created successfully!');
      setShowCreateForm(false);
      setSelectedStudent(null);
      setSubjectMarks([]);
      await fetchData();
      
    } catch (error: any) {
      console.error('Error creating result:', error);
      toast.error(error?.response?.data?.error || 'Failed to create result');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitResult = async (resultId: number) => {
    try {
      setSubmitting(true);
      await submitResult(resultId);
      toast.success('Result submitted to coordinator!');
      await fetchData();
    } catch (error: any) {
      console.error('Error submitting result:', error);
      toast.error(error?.response?.data?.error || 'Failed to submit result');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-blue-100 text-blue-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-orange-100 text-orange-800';
      case 'D': return 'bg-red-100 text-red-800';
      case 'F': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-[#274c77] mb-2 tracking-wide">Result Management</h2>
          <p className="text-gray-600 text-lg">Loading your class students...</p>
        </div>
        <LoadingSpinner message="Loading students and results..." />
      </div>
    );
  }

	return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-[#274c77] mb-2 tracking-wide">Result Management</h2>
        <p className="text-gray-600 text-lg">
          Manage results for your class: {teacherProfile?.assigned_classroom?.class_name} - {teacherProfile?.assigned_classroom?.section}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-[#274c77]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-[#274c77]">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-[#6096ba]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-[#6096ba]">{safeResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {safeResults.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {safeResults.filter(r => ['draft', 'submitted', 'under_review'].includes(r.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Result Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#274c77] hover:bg-[#1e3a5f] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Result
        </Button>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#274c77]">My Results</CardTitle>
          <CardDescription>All results created by you</CardDescription>
        </CardHeader>
        <CardContent>
          {safeResults.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500">Create your first result using the "Create New Result" button.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
					<thead>
						<tr className="bg-[#a3cef1] text-[#274c77]">
                    <th className="py-3 px-4 border font-semibold">Student</th>
                    <th className="py-3 px-4 border font-semibold">Exam Type</th>
                    <th className="py-3 px-4 border font-semibold">Total Marks</th>
                    <th className="py-3 px-4 border font-semibold">Obtained</th>
                    <th className="py-3 px-4 border font-semibold">Percentage</th>
                    <th className="py-3 px-4 border font-semibold">Grade</th>
                    <th className="py-3 px-4 border font-semibold">Status</th>
                    <th className="py-3 px-4 border font-semibold">Edits Left</th>
                    <th className="py-3 px-4 border font-semibold">Actions</th>
						</tr>
					</thead>
					<tbody>
                  {safeResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="border py-3 px-4 font-medium">
                        {result.student.student_code} - {result.student.full_name}
                      </td>
                      <td className="border py-3 px-4">{result.exam_type_display}</td>
                      <td className="border py-3 px-4">{result.total_marks}</td>
                      <td className="border py-3 px-4">{result.obtained_marks}</td>
                      <td className="border py-3 px-4">{result.percentage.toFixed(2)}%</td>
                      <td className="border py-3 px-4">
                        <Badge className={getGradeColor(result.grade)}>
                          {result.grade}
                        </Badge>
                      </td>
                      <td className="border py-3 px-4">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status_display}
                        </Badge>
                      </td>
                      <td className="border py-3 px-4">
                        {result.status === 'draft' ? '∞' : Math.max(0, 3 - result.edit_count)}
                      </td>
                      <td className="border py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* View result */}}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {result.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {/* Edit result */}}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          )}
                          {result.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleSubmitResult(result.id)}
                              disabled={submitting}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Result Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-[#274c77] to-[#6096ba] text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Plus className="h-6 w-6" />
                Create New Result
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Create result for a student in your class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {/* Step 1: Student Selection */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#274c77]" />
                  Select Student *
                </label>
                <div className="relative">
                <select
                  value={selectedStudent?.id || ''}
                  onChange={(e) => handleStudentChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#274c77] focus:border-[#274c77] transition-all duration-200 bg-white shadow-sm text-lg"
                >
                    <option value="">🎓 Choose a student from your class</option>
                    {students.length > 0 ? (
                      students.map((student, index) => {
                        console.log(`Student ${index}:`, student);
                        return (
                          <option key={student.id} value={student.id}>
                            {student.student_code || student.student_id || student.gr_no} - {student.name || student.full_name}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>❌ No students found in your class</option>
                    )}
                </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {students.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <p className="text-yellow-800 font-medium">No students found in your assigned classroom</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Exam Type Selection */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#274c77]" />
                  Exam Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {EXAM_TYPES.map(type => (
                    <label key={type.value} className="relative cursor-pointer">
											<input
                        type="radio"
                        name="examType"
                        value={type.value}
                        checked={examType === type.value}
                        onChange={() => handleExamTypeChange(type.value as 'mid_term' | 'final_term')}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        examType === type.value 
                          ? 'border-[#274c77] bg-blue-50 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            examType === type.value 
                              ? 'border-[#274c77] bg-[#274c77]' 
                              : 'border-gray-300'
                          }`}>
                            {examType === type.value && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className={`font-medium text-lg ${
                            examType === type.value ? 'text-[#274c77]' : 'text-gray-700'
                          }`}>
                      {type.label}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {examType === 'final_term' && midTermCheck && !midTermCheck.mid_term_approved && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <p className="text-red-800 font-medium">
                    Mid-term result must be approved before creating final-term result
                  </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Subject Marks Entry */}
              {selectedStudent && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#274c77] to-[#6096ba] text-white p-4 rounded-xl">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Award className="h-6 w-6" />
                      Subject Marks Entry
                    </h3>
                    <p className="text-blue-100 mt-1">
                      Enter marks for {selectedStudent.name || selectedStudent.full_name} ({selectedStudent.student_code || selectedStudent.student_id || selectedStudent.gr_no})
                    </p>
                  </div>
                  <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <th className="py-4 px-4 text-left font-semibold text-gray-800 border-b">Subject</th>
                          <th className="py-4 px-4 text-center font-semibold text-gray-800 border-b">Theory Total</th>
                          <th className="py-4 px-4 text-center font-semibold text-gray-800 border-b">Theory Obtained</th>
                          <th className="py-4 px-4 text-center font-semibold text-gray-800 border-b">
                            Min: {examType === 'mid_term' ? '33' : '40'}
                          </th>
                          <th className="py-4 px-4 text-center font-semibold text-gray-800 border-b">Practical Total</th>
                          <th className="py-4 px-4 text-center font-semibold text-gray-800 border-b">Practical Obtained</th>
                          <th className="py-4 px-4 text-center font-semibold text-gray-800 border-b">
                            Min: {examType === 'mid_term' ? '7' : '8'}
                          </th>
                          <th className="py-4 px-4 text-center font-semibold text-gray-800 border-b">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectMarks.map((mark, index) => {
                          const subject = SUBJECTS.find(s => s.name === mark.subject_name);
                          return (
                            <tr key={mark.subject_name} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="py-4 px-4 font-semibold text-gray-800 border-b">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-[#274c77]" />
                                  {subject?.display}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center font-medium text-gray-700 border-b">
                                {mark.total_marks}
                              </td>
                              <td className="py-4 px-4 text-center border-b">
                                <Input
												type="number"
                                  value={mark.obtained_marks}
                                  onChange={(e) => handleMarkChange(mark.subject_name, 'obtained_marks', parseInt(e.target.value) || 0)}
                                  className="w-24 text-center border-2 border-gray-200 rounded-lg focus:border-[#274c77] focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                  min="0"
                                  max="100"
                                />
                              </td>
                              <td className="py-4 px-4 text-center text-sm font-medium text-gray-500 border-b">
                                {examType === 'mid_term' ? '33' : '40'}
                              </td>
                              <td className="py-4 px-4 text-center font-medium text-gray-700 border-b">
                                {mark.has_practical ? mark.practical_total : '-'}
									</td>
                              <td className="py-4 px-4 text-center border-b">
                                {mark.has_practical ? (
                                  <Input
												type="number"
                                    value={mark.practical_obtained || 0}
                                    onChange={(e) => handleMarkChange(mark.subject_name, 'practical_obtained', parseInt(e.target.value) || 0)}
                                    className="w-24 text-center border-2 border-gray-200 rounded-lg focus:border-[#274c77] focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                    min="0"
                                    max="20"
                                  />
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-center text-sm font-medium text-gray-500 border-b">
                                {mark.has_practical ? (examType === 'mid_term' ? '7' : '8') : '-'}
                              </td>
                              <td className="py-4 px-4 text-center border-b">
                                <div className="flex justify-center">
                                {mark.is_pass ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="h-5 w-5" />
                                      <span className="text-sm font-medium">Pass</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-red-600">
                                      <AlertCircle className="h-5 w-5" />
                                      <span className="text-sm font-medium">Fail</span>
                                    </div>
										)}
                                </div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
                  </div>

                  {/* Summary */}
                  <div className={`rounded-xl p-6 shadow-lg border-2 ${
                    calculateTotals().overallPass 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                  }`}>
                    <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                      calculateTotals().overallPass ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {calculateTotals().overallPass ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Result Summary - PASS
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5" />
                          Result Summary - FAIL
                        </>
                      )}
                    </h4>
                    
                    {/* Warning for fail results */}
                    {!calculateTotals().overallPass && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <p className="text-yellow-800 font-medium">
                            ⚠️ This student has failed. You can still create the result for record keeping.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {(() => {
                      const { totalMarks, obtainedMarks, percentage, overallPass } = calculateTotals();
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Total Marks</div>
                            <div className="text-2xl font-bold text-[#274c77]">{totalMarks}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Obtained Marks</div>
                            <div className="text-2xl font-bold text-[#6096ba]">{obtainedMarks}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Percentage</div>
                            <div className="text-2xl font-bold text-orange-600">{percentage.toFixed(2)}%</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Overall Status</div>
                            <div className={`text-2xl font-bold flex items-center gap-2 ${overallPass ? 'text-green-600' : 'text-red-600'}`}>
                              {overallPass ? (
                                <>
                                  <CheckCircle className="h-6 w-6" />
                                  PASS
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-6 w-6" />
                                  FAIL
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleCreateResult}
                  disabled={creating || !selectedStudent}
                  className="flex-1 bg-gradient-to-r from-[#274c77] to-[#6096ba] hover:from-[#1e3a5f] hover:to-[#4a7c9a] text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {creating ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Creating Result...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Create Result
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1 py-3 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
			</div>
	);
}