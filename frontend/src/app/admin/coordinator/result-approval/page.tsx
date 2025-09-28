"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Clock, XCircle, Eye, Award, FileText, TrendingUp } from "lucide-react"

export default function ResultApprovalPage() {
  useEffect(() => {
    document.title = "Result Approval - Coordinator | IAK SMS";
  }, []);

  const [selectedTerm, setSelectedTerm] = useState("current")
  const [selectedSubject, setSelectedSubject] = useState("all")

  const pendingResults = [
    { id: 1, teacher: "Ahmed Ali", subject: "Mathematics", class: "Grade 5A", students: 30, submittedDate: "2024-01-15", status: "Pending" },
    { id: 2, teacher: "Fatima Sheikh", subject: "English", class: "Grade 6B", students: 28, submittedDate: "2024-01-14", status: "Under Review" },
    { id: 3, teacher: "Muhammad Hassan", subject: "Science", class: "Grade 7A", students: 25, submittedDate: "2024-01-13", status: "Approved" },
    { id: 4, teacher: "Aisha Khan", subject: "Urdu", class: "Grade 4B", students: 32, submittedDate: "2024-01-12", status: "Rejected" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#6096ba'
      case 'Pending': return '#8b8c89'
      case 'Under Review': return '#274c77'
      case 'Rejected': return '#ef4444'
      default: return '#8b8c89'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return CheckCircle
      case 'Pending': return Clock
      case 'Under Review': return Eye
      case 'Rejected': return XCircle
      default: return Clock
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Result Approval</h1>
        <p className="text-gray-600">Review and approve student results submitted by teachers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ backgroundColor: '#e7ecef', borderColor: '#a3cef1' }}>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2" style={{ color: '#8b8c89' }} />
            <div className="text-2xl font-bold" style={{ color: '#274c77' }}>
              {pendingResults.filter(r => r.status === 'Pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending Approval</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }}>
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2" style={{ color: '#274c77' }} />
            <div className="text-2xl font-bold" style={{ color: '#274c77' }}>
              {pendingResults.filter(r => r.status === 'Under Review').length}
            </div>
            <div className="text-sm" style={{ color: '#274c77' }}>Under Review</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#6096ba' }}>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">
              {pendingResults.filter(r => r.status === 'Approved').length}
            </div>
            <div className="text-sm text-white">Approved</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#274c77' }}>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">{pendingResults.length}</div>
            <div className="text-sm text-white">Total Submissions</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Academic Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Term</SelectItem>
                  <SelectItem value="previous">Previous Term</SelectItem>
                  <SelectItem value="all">All Terms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Result Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#274c77' }}>
                  <th className="text-left py-3 px-4 text-white">Teacher</th>
                  <th className="text-left py-3 px-4 text-white">Subject</th>
                  <th className="text-left py-3 px-4 text-white">Class</th>
                  <th className="text-left py-3 px-4 text-white">Students</th>
                  <th className="text-left py-3 px-4 text-white">Submitted</th>
                  <th className="text-left py-3 px-4 text-white">Status</th>
                  <th className="text-left py-3 px-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingResults.map((result, index) => {
                  const StatusIcon = getStatusIcon(result.status);
                  return (
                    <tr key={result.id} style={{ backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white' }}>
                      <td className="py-3 px-4 font-medium">{result.teacher}</td>
                      <td className="py-3 px-4">{result.subject}</td>
                      <td className="py-3 px-4">{result.class}</td>
                      <td className="py-3 px-4">{result.students}</td>
                      <td className="py-3 px-4">{result.submittedDate}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          style={{ 
                            backgroundColor: getStatusColor(result.status),
                            color: 'white'
                          }}
                          className="flex items-center space-x-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span>{result.status}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          {result.status === 'Pending' && (
                            <Button size="sm" style={{ backgroundColor: '#6096ba', color: 'white' }}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
