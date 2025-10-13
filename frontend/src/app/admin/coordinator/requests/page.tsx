"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Eye, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Calendar,
  User,
  Filter,
  BarChart3,
  TrendingUp,
  Users
} from "lucide-react";
import { 
  getCoordinatorRequests, 
  getCoordinatorDashboardStats,
  getRequestDetail,
  updateRequestStatus,
  addRequestComment,
  RequestUpdateData
} from "@/lib/api";
import { getCurrentUserRole } from "@/lib/permissions";

interface Request {
  id: number;
  category: string;
  category_display: string;
  subject: string;
  description: string;
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  teacher_name: string;
  coordinator_name: string;
  coordinator_notes?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  resolved_at?: string;
  comments?: Comment[];
  status_history?: StatusHistory[];
}

interface Comment {
  id: number;
  user_type: string;
  comment: string;
  created_at: string;
}

interface StatusHistory {
  id: number;
  old_status?: string;
  new_status: string;
  changed_by: string;
  notes?: string;
  changed_at: string;
}

interface DashboardStats {
  total_requests: number;
  submitted: number;
  under_review: number;
  in_progress: number;
  waiting: number;
  resolved: number;
  rejected: number;
}

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const CATEGORY_OPTIONS = [
  { value: 'leave', label: 'Leave Request' },
  { value: 'salary', label: 'Salary Issue' },
  { value: 'facility', label: 'Facility Complaint' },
  { value: 'resource', label: 'Resource Request' },
  { value: 'student', label: 'Student Related' },
  { value: 'admin', label: 'Administrative Issue' },
  { value: 'other', label: 'Other' },
];

const STATUS_COLORS = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  waiting: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function CoordinatorRequestPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_requests: 0,
    submitted: 0,
    under_review: 0,
    in_progress: 0,
    waiting: 0,
    resolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
  });

  const userRole = getCurrentUserRole();

  useEffect(() => {
    if (userRole === 'coordinator') {
      document.title = "Request Management | IAK SMS";
      fetchData();
    }
  }, [userRole]);

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchRequests(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      // Filter out "all" values before sending to API
      const apiFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value && value !== 'all')
      );
      const data = await getCoordinatorRequests(apiFilters);
      setRequests(data as Request[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getCoordinatorDashboardStats();
      setStats(data as DashboardStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewDetails = async (requestId: number) => {
    try {
      const data = await getRequestDetail(requestId);
      setSelectedRequest(data as Request);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleUpdateStatus = async (updateData: RequestUpdateData) => {
    if (!selectedRequest) return;

    try {
      setUpdating(true);
      await updateRequestStatus(selectedRequest.id, updateData);
      
      // Refresh data
      await Promise.all([
        fetchRequests(),
        fetchStats(),
      ]);
      
      // Refresh selected request
      const updatedData = await getRequestDetail(selectedRequest.id);
      setSelectedRequest(updatedData as Request);
      
      alert('Request updated successfully!');
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedRequest) return;

    try {
      setAddingComment(true);
      await addRequestComment(selectedRequest.id, newComment);
      
      // Refresh request details
      const updatedData = await getRequestDetail(selectedRequest.id);
      setSelectedRequest(updatedData as Request);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setAddingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'waiting': return <AlertCircle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-[#274c77] mb-2 tracking-wide">Request Management</h2>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-[#274c77] mb-2 tracking-wide">Request Management</h2>
        <p className="text-gray-600 text-lg">Manage teacher requests and complaints</p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Requests</p>
                <p className="text-3xl font-bold text-blue-700">{stats.total_requests}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.submitted}</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">In Progress</p>
                <p className="text-3xl font-bold text-purple-700">{stats.in_progress}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Resolved</p>
                <p className="text-3xl font-bold text-green-700">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#274c77] flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters({ ...filters, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#274c77]">Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No requests found</h3>
              <p className="text-gray-500">No requests match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#274c77]">{request.subject}</h3>
                        <Badge className={STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status_display}</span>
                        </Badge>
                        <Badge className={PRIORITY_COLORS[request.priority as keyof typeof PRIORITY_COLORS]}>
                          {request.priority_display}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {request.category_display}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          From: {request.teacher_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(request.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2">{request.description}</p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(request.id)}
                      className="ml-4"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#274c77]">Request Management</DialogTitle>
            <DialogDescription>
              Review and manage this request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#274c77]">{selectedRequest.subject}</h3>
                    <p className="text-gray-600">{selectedRequest.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge className={STATUS_COLORS[selectedRequest.status as keyof typeof STATUS_COLORS]}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1">{selectedRequest.status_display}</span>
                    </Badge>
                    <Badge className={PRIORITY_COLORS[selectedRequest.priority as keyof typeof PRIORITY_COLORS]}>
                      {selectedRequest.priority_display}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{selectedRequest.category_display}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teacher:</span>
                    <span className="font-medium">{selectedRequest.teacher_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(selectedRequest.created_at)}</span>
                  </div>
                  {selectedRequest.reviewed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reviewed:</span>
                      <span className="font-medium">{formatDate(selectedRequest.reviewed_at)}</span>
                    </div>
                  )}
                  {selectedRequest.resolved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolved:</span>
                      <span className="font-medium">{formatDate(selectedRequest.resolved_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Update Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#274c77]">Update Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <Select
                        value={selectedRequest.status}
                        onValueChange={(value) => {
                          const updateData: RequestUpdateData = { status: value };
                          handleUpdateStatus(updateData);
                        }}
                        disabled={updating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Priority</label>
                      <Select
                        value={selectedRequest.priority}
                        onValueChange={(value) => {
                          const updateData: RequestUpdateData = { priority: value };
                          handleUpdateStatus(updateData);
                        }}
                        disabled={updating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Coordinator Notes</label>
                    <Textarea
                      value={selectedRequest.coordinator_notes || ''}
                      onChange={(e) => {
                        const updateData: RequestUpdateData = { coordinator_notes: e.target.value };
                        handleUpdateStatus(updateData);
                      }}
                      placeholder="Add notes for the teacher..."
                      rows={3}
                      disabled={updating}
                    />
                  </div>

                  {(selectedRequest.status === 'resolved' || selectedRequest.status === 'rejected') && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Resolution Notes</label>
                      <Textarea
                        value={selectedRequest.resolution_notes || ''}
                        onChange={(e) => {
                          const updateData: RequestUpdateData = { resolution_notes: e.target.value };
                          handleUpdateStatus(updateData);
                        }}
                        placeholder="Add resolution details..."
                        rows={3}
                        disabled={updating}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[#274c77]">Comments</h4>
                
                {/* Add Comment */}
                <div className="space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={addingComment || !newComment.trim()}
                    size="sm"
                    className="bg-[#6096ba] hover:bg-[#274c77]"
                  >
                    {addingComment ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Adding...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Add Comment
                      </>
                    )}
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {selectedRequest.comments?.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {comment.user_type === 'teacher' ? 'Teacher' : 'Coordinator'}
                        </Badge>
                        <span className="text-sm text-gray-600">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
