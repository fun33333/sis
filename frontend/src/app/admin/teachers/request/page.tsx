"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Plus, 
  Eye, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Calendar,
  User
} from "lucide-react";
import { 
  createRequest, 
  getMyRequests, 
  getRequestDetail, 
  addRequestComment,
  RequestData 
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

const CATEGORY_OPTIONS = [
  { value: 'leave', label: 'Leave Request' },
  { value: 'salary', label: 'Salary Issue' },
  { value: 'facility', label: 'Facility Complaint' },
  { value: 'resource', label: 'Resource Request' },
  { value: 'student', label: 'Student Related' },
  { value: 'admin', label: 'Administrative Issue' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
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

export default function TeacherRequestPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  
  const [formData, setFormData] = useState<RequestData>({
    category: '',
    subject: '',
    description: '',
  });

  const userRole = getCurrentUserRole();

  useEffect(() => {
    if (userRole === 'teacher') {
      document.title = "My Requests & Complaints | IAK SMS";
      fetchRequests();
    }
  }, [userRole]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getMyRequests();
      setRequests(data as Request[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.subject || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await createRequest(formData);
      
      // Reset form
      setFormData({
        category: '',
        subject: '',
        description: '',
      });
      
      // Refresh requests list
      await fetchRequests();
      
      alert('Request submitted successfully!');
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
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
          <h2 className="text-3xl font-extrabold text-[#274c77] mb-2 tracking-wide">My Requests & Complaints</h2>
          <p className="text-gray-600 text-lg">Loading your requests...</p>
        </div>
        <LoadingSpinner message="Loading requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-[#274c77] mb-2 tracking-wide">My Requests & Complaints</h2>
        <p className="text-gray-600 text-lg">Submit requests and track their status with your coordinator</p>
        </div>

      <Tabs defaultValue="my-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          <TabsTrigger value="create-request">Create Request</TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests" className="space-y-6">
              {requests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No requests found</h3>
                <p className="text-gray-500 text-center">You haven't submitted any requests yet. Create your first request using the "Create Request" tab.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
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
                            To: {request.coordinator_name}
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
                        View Details
          </Button>
                </div>
                  </CardContent>
                </Card>
              ))}
              </div>
          )}
        </TabsContent>

        <TabsContent value="create-request" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#274c77]">Create New Request</CardTitle>
              <CardDescription>
                Submit a request or complaint to your assigned coordinator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Category *</label>
                     <Select
                       value={formData.category}
                       onValueChange={(value) => setFormData({ ...formData, category: value })}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select category" />
                       </SelectTrigger>
                       <SelectContent>
                         {CATEGORY_OPTIONS.map((option) => (
                           <SelectItem key={option.value} value={option.value}>
                             {option.label}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject *</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your request"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about your request..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#6096ba] hover:bg-[#274c77] text-white"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#274c77]">Request Details</DialogTitle>
            <DialogDescription>
              View and manage your request details
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
                    <span className="text-gray-600">Coordinator:</span>
                    <span className="font-medium">{selectedRequest.coordinator_name}</span>
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

              {/* Coordinator Notes */}
              {selectedRequest.coordinator_notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#274c77]">Coordinator Notes</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedRequest.coordinator_notes}</p>
                </div>
                </div>
              )}

              {/* Resolution Notes */}
              {selectedRequest.resolution_notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#274c77]">Resolution Notes</h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedRequest.resolution_notes}</p>
            </div>
          </div>
        )}

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
