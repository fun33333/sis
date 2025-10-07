"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, BookOpen, Award, BarChart3, Eye } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { getCoordinatorTeachers } from "@/lib/api"

interface Teacher {
  id: number;
  full_name: string;
  employee_code: string;
  email: string;
  current_subjects: string;
  current_classes_taught: string;
  shift: string;
  is_class_teacher: boolean;
  assigned_classroom: string | null;
  joining_date: string;
  total_experience_years: number;
  is_currently_active: boolean;
}

export default function SectionsProgressPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Sections Progress - Coordinator | IAK SMS";
    
    // Get coordinator ID from localStorage
    const user = localStorage.getItem("sis_user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        const coordinatorId = 1; // This should come from user data
        
        fetchTeachers(coordinatorId);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTeachers = async (coordinatorId: number) => {
    try {
      const data = await getCoordinatorTeachers(coordinatorId);
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate sections data from real teachers
  const sectionsData = teachers.map((teacher, index) => ({
    section: teacher.assigned_classroom || `Section ${index + 1}`,
    students: Math.floor(Math.random() * 20) + 20, // Mock student count
    avgScore: Math.floor(Math.random() * 30) + 70, // Mock average score
    attendance: Math.floor(Math.random() * 20) + 80, // Mock attendance
    subjects: teacher.current_subjects ? teacher.current_subjects.split(',').length : 1,
    teacher: teacher.full_name,
    performance: teacher.total_experience_years > 5 ? "Excellent" : teacher.total_experience_years > 2 ? "Good" : "Average",
    shift: teacher.shift,
    employee_code: teacher.employee_code,
    is_class_teacher: teacher.is_class_teacher
  }))

  const subjectProgress = [
    { subject: "Mathematics", avgScore: 85, color: '#274c77' },
    { subject: "English", avgScore: 78, color: '#6096ba' },
    { subject: "Science", avgScore: 82, color: '#a3cef1' },
    { subject: "Urdu", avgScore: 80, color: '#8b8c89' },
  ]

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Excellent': return '#6096ba'
      case 'Good': return '#10b981'
      case 'Average': return '#8b8c89'
      case 'Needs Improvement': return '#ef4444'
      default: return '#8b8c89'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Sections Progress</h1>
          <p className="text-gray-600">Loading teacher data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Sections Progress</h1>
        <p className="text-gray-600">Monitor academic progress and performance across all sections</p>
        <p className="text-sm text-gray-500 mt-1">Showing {teachers.length} teachers from your campus</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ backgroundColor: '#e7ecef', borderColor: '#a3cef1' }}>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2" style={{ color: '#274c77' }} />
            <div className="text-2xl font-bold" style={{ color: '#274c77' }}>
              {sectionsData.reduce((acc, section) => acc + section.students, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }}>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2" style={{ color: '#274c77' }} />
            <div className="text-2xl font-bold" style={{ color: '#274c77' }}>{sectionsData.length}</div>
            <div className="text-sm" style={{ color: '#274c77' }}>Active Sections</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#6096ba' }}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">
              {(sectionsData.reduce((acc, section) => acc + section.avgScore, 0) / sectionsData.length).toFixed(1)}%
            </div>
            <div className="text-sm text-white">Average Score</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#274c77' }}>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">
              {(sectionsData.reduce((acc, section) => acc + section.attendance, 0) / sectionsData.length).toFixed(1)}%
            </div>
            <div className="text-sm text-white">Average Attendance</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Performance */}
        <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle style={{ color: '#274c77' }} className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Section Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ecef" />
                <XAxis dataKey="section" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #6096ba',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="avgScore" fill="#6096ba" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle style={{ color: '#274c77' }} className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectProgress}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="avgScore"
                  label={({ subject, avgScore }) => `${subject}: ${avgScore}%`}
                >
                  {subjectProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sections Details Table */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Detailed Section Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#274c77' }}>
                  <th className="text-left py-3 px-4 text-white">Section</th>
                  <th className="text-left py-3 px-4 text-white">Class Teacher</th>
                  <th className="text-left py-3 px-4 text-white">Students</th>
                  <th className="text-left py-3 px-4 text-white">Avg Score</th>
                  <th className="text-left py-3 px-4 text-white">Attendance</th>
                  <th className="text-left py-3 px-4 text-white">Performance</th>
                  <th className="text-left py-3 px-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sectionsData.map((section, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white' }}>
                    <td className="py-3 px-4 font-medium">{section.section}</td>
                    <td className="py-3 px-4">{section.teacher}</td>
                    <td className="py-3 px-4">{section.students}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{section.avgScore}%</span>
                        <Progress value={section.avgScore} className="w-16 h-2" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{section.attendance}%</span>
                        <Progress value={section.attendance} className="w-16 h-2" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        style={{ 
                          backgroundColor: getPerformanceColor(section.performance),
                          color: 'white'
                        }}
                      >
                        {section.performance}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
