"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  Award, 
  FileText, 
  TrendingUp, 
  Search,
  Filter,
  CheckSquare,
  Square,
  MessageSquare,
  Send
} from "lucide-react"
import { 
  getCoordinatorResults,
  getCoordinatorPendingResults,
  approveResult,
  rejectResult,
  bulkApproveResults,
  bulkRejectResults,
  getCurrentUserProfile,
  Result,
  Student
} from '@/lib/api';
import { toast } from "sonner";

interface CoordinatorProfile {
  id: number;
  full_name: string;
  employee_code: string;
  level: {
    id: number;
    name: string;
  };
  campus: {
    campus_name: string;
  };
}

interface ResultWithDetails {
  id: number;
  student: Student;
  teacher: {
    id: number;
    full_name: string;
    employee_code: string;
  };
  subject_marks: any[];
  exam_type: string;
  status: string;
  result_status: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  grade: string;
  created_at: string;
  updated_at: string;
}

export default function ResultApprovalPage() {
  const [coordinatorProfile, setCoordinatorProfile] = useState<CoordinatorProfile | null>(null);
  const [results, setResults] = useState<ResultWithDetails[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [selectedResults, setSelectedResults] = useState<number[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject">("approve");
  const [bulkComments, setBulkComments] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    document.title = "Result Approval - Coordinator | IAK SMS";
    fetchData();
  }, []);

  useEffect(() => {
    filterResults();
  }, [results, searchTerm, statusFilter, gradeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting fetchData...');
      
      // API connectivity will be tested through authenticated calls
      
      // Check if user is logged in
      const token = localStorage.getItem('sis_access_token');
      console.log('🔑 Token check:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.error('❌ No authentication token found');
        toast.error('Please log in again');
        // Clear all auth data
        localStorage.removeItem('sis_access_token');
        localStorage.removeItem('sis_refresh_token');
        // Redirect to login
        window.location.href = '/Universal_Login';
        return;
      }
      
      // Get coordinator profile
      console.log('👤 Fetching coordinator profile...');
      try {
        const profile = await getCurrentUserProfile();
        console.log('👤 Profile received:', profile);
        
        // Check if user is coordinator
        if ((profile as any).role !== 'coordinator') {
          console.error('❌ User is not a coordinator');
          toast.error('Access denied. Coordinator access required.');
          window.location.href = '/Universal_Login';
          return;
        }
        
        setCoordinatorProfile(profile as CoordinatorProfile);
      } catch (profileError: any) {
        console.error('❌ Error fetching profile:', profileError);
        if (profileError?.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.clear();
          window.location.href = '/Universal_Login';
          return;
        }
        throw profileError;
      }
      
      // Fetch all results assigned to coordinator
      console.log('📊 Fetching coordinator results...');
      try {
        const resultsData = await getCoordinatorResults();
        console.log('📊 Coordinator results data from API:', resultsData);
        console.log('📊 Results data type:', typeof resultsData);
        console.log('📊 Is array?', Array.isArray(resultsData));
        console.log('📊 Results length:', Array.isArray(resultsData) ? resultsData.length : 0);
        console.log('📊 First result:', Array.isArray(resultsData) ? resultsData[0] : 'Not array');
        console.log('📊 All results statuses:', Array.isArray(resultsData) ? resultsData.map((r: any) => ({ id: r.id, status: r.status, student: r.student?.name })) : 'Not array');
        
        // Ensure results is always an array
        const safeResults = Array.isArray(resultsData) ? resultsData : [];
        console.log('📊 Safe results set:', safeResults.length);
        setResults(safeResults as ResultWithDetails[]);
        
        if (safeResults.length === 0) {
          console.log('ℹ️ No results found for this coordinator');
          toast.info('No results found. Teachers need to forward results to you first.');
        } else {
          console.log('✅ Successfully loaded results for coordinator');
          toast.success(`Loaded ${safeResults.length} results successfully!`);
        }
      } catch (resultsError: any) {
        console.error('❌ Error fetching results:', resultsError);
        console.error('❌ Error status:', resultsError?.status);
        console.error('❌ Error message:', resultsError?.message);
        console.error('❌ Full error:', resultsError);
        
        if (resultsError?.status === 401) {
          console.log('🔐 Authentication error - redirecting to login');
          toast.error('Session expired. Please log in again.');
          localStorage.clear();
          window.location.href = '/Universal_Login';
          return;
        }
        
        // Show more specific error message
        const errorMessage = resultsError?.message || resultsError?.response?.data?.error || 'Failed to load results. Please try again.';
        toast.error(`Error: ${errorMessage}`);
        setResults([]);
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching data:', error);
      console.error('❌ Error details:', error?.message);
      console.error('❌ Error stack:', error?.stack);
      toast.error('Failed to load data');
      // Set empty array on error
      setResults([]);
    } finally {
      setLoading(false);
      console.log('✅ fetchData completed');
    }
  };

  const filterResults = () => {
    // Ensure results is always an array
    const safeResults = Array.isArray(results) ? results : [];
    let filtered = [...safeResults];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student?.student_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.teacher?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(result => result.status === statusFilter);
    }

    // Grade filter
    if (gradeFilter !== "all") {
      filtered = filtered.filter(result => 
        result.student?.class_name === gradeFilter
      );
    }

    setFilteredResults(filtered);
  };

  const handleApprove = async (resultId: number) => {
    try {
      setProcessing(true);
      await approveResult(resultId, { status: 'approved', coordinator_comments: '' });
      toast.success('Result approved successfully!');
      await fetchData();
    } catch (error) {
      console.error('Error approving result:', error);
      toast.error('Failed to approve result');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (resultId: number) => {
    try {
      setProcessing(true);
      await rejectResult(resultId, { status: 'rejected', coordinator_comments: 'Please review and resubmit' });
      toast.success('Result rejected successfully!');
      await fetchData();
    } catch (error) {
      console.error('Error rejecting result:', error);
      toast.error('Failed to reject result');
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectResult = (resultId: number) => {
    setSelectedResults(prev =>
      prev.includes(resultId)
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const handleSelectAll = () => {
    const safeFilteredResults = Array.isArray(filteredResults) ? filteredResults : [];
    if (selectedResults.length === safeFilteredResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(safeFilteredResults.map(r => r.id));
    }
  };

  const handleBulkAction = async () => {
    if (selectedResults.length === 0) {
      toast.error('Please select results to process');
      return;
    }

    try {
      setProcessing(true);
      
      if (bulkAction === "approve") {
        await bulkApproveResults(selectedResults, bulkComments);
        toast.success(`Approved ${selectedResults.length} results successfully!`);
      } else {
        await bulkRejectResults(selectedResults, bulkComments);
        toast.success(`Rejected ${selectedResults.length} results successfully!`);
      }
      
      setShowBulkModal(false);
      setSelectedResults([]);
      setBulkComments("");
      await fetchData();
      
    } catch (error) {
      console.error('Error processing bulk action:', error);
      toast.error('Failed to process bulk action');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Send },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Eye },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getResultStatusBadge = (resultStatus: string) => {
    return resultStatus === 'pass' ? (
      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        PASS
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        FAIL
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-3xl font-bold text-[#274c77]">Result Approval</h1>
          <p className="text-gray-600 mt-2">
            Review and approve results from teachers
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
            {coordinatorProfile?.level?.name || 'Unknown'} Level Coordinator
          </Badge>
          <Badge className="bg-green-100 text-green-800 px-3 py-1">
            {Array.isArray(filteredResults) ? filteredResults.length : 0} Results
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Array.isArray(filteredResults) ? filteredResults.filter(r => r.status === 'pending').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Array.isArray(filteredResults) ? filteredResults.filter(r => r.status === 'submitted').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {Array.isArray(filteredResults) ? filteredResults.filter(r => r.status === 'approved').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-[#274c77]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-[#274c77]">
                  {Array.isArray(filteredResults) ? filteredResults.length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students or teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#274c77]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#274c77]"
            >
              <option value="all">All Grades</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
            </select>

            <Button
              onClick={() => setShowBulkModal(true)}
              disabled={selectedResults.length === 0}
              className="bg-[#274c77] hover:bg-[#1e3a5f] text-white"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Bulk Action ({selectedResults.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Results ({Array.isArray(filteredResults) ? filteredResults.length : 0})
          </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {selectedResults.length === (Array.isArray(filteredResults) ? filteredResults.length : 0) ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <CheckSquare className="h-4 w-4" />
                )}
                Select All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Select</th>
                  <th className="text-left p-3">Student</th>
                  <th className="text-left p-3">Class Grade</th>
                  <th className="text-left p-3">Teacher</th>
                  <th className="text-left p-3">Exam Type</th>
                  <th className="text-left p-3">Marks</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Result</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filteredResults) ? filteredResults.map((result) => (
                  <tr key={result.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedResults.includes(result.id)}
                        onChange={() => handleSelectResult(result.id)}
                        className="h-4 w-4 text-[#274c77] focus:ring-[#274c77] border-gray-300 rounded"
                      />
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{result.student.name}</div>
                        <div className="text-sm text-gray-500">{result.student.student_code}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-purple-100 text-purple-800 font-medium">
                        {result.student.class_name || 'N/A'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{result.teacher.full_name}</div>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        {result.exam_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>{result.obtained_marks}/{result.total_marks}</div>
                        <div className="text-gray-500">{result.percentage.toFixed(1)}%</div>
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(result.status)}
                    </td>
                    <td className="p-3">
                      {getResultStatusBadge(result.result_status)}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {new Date(result.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {result.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(result.id)}
                              disabled={processing}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                          </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(result.id)}
                              disabled={processing}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {result.status === 'submitted' && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Submitted
                          </Badge>
                        )}
                        {result.status === 'under_review' && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Under Review
                          </Badge>
                        )}
                        {result.status === 'approved' && (
                          <Badge className="bg-green-100 text-green-800">
                            Approved
                          </Badge>
                        )}
                        {result.status === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800">
                            Rejected
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* View details */}}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        </div>
                      </td>
                    </tr>
                )) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Bulk Action
              </CardTitle>
              <CardDescription>
                Process {selectedResults.length} selected results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <div className="flex gap-2">
                  <Button
                    variant={bulkAction === "approve" ? "default" : "outline"}
                    onClick={() => setBulkAction("approve")}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={bulkAction === "reject" ? "destructive" : "outline"}
                    onClick={() => setBulkAction("reject")}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
                <textarea
                  value={bulkComments}
                  onChange={(e) => setBulkComments(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#274c77]"
                  rows={3}
                  placeholder="Add comments for this action..."
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleBulkAction}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? <LoadingSpinner /> : 'Process'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
