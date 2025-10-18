'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  GraduationCap, 
  Building, 
  Calendar,
  AlertCircle,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getTransferRequests, 
  approveTransfer, 
  declineTransfer, 
  cancelTransfer,
  TransferRequest 
} from '@/lib/api';
import { getCurrentUserRole } from '@/lib/permissions';

export default function TransferManagementPage() {
  const router = useRouter();
  const userRole = getCurrentUserRole();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  
  // Data
  const [outgoingRequests, setOutgoingRequests] = useState<TransferRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<TransferRequest[]>([]);
  
  // UI State
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  
  // Load data
  useEffect(() => {
    loadTransferRequests();
  }, []);
  
  const loadTransferRequests = async () => {
    try {
      setLoading(true);
      const [outgoing, incoming] = await Promise.all([
        getTransferRequests({ direction: 'outgoing' }),
        getTransferRequests({ direction: 'incoming' })
      ]);
      setOutgoingRequests(outgoing as TransferRequest[]);
      setIncomingRequests(incoming as TransferRequest[]);
    } catch (error) {
      console.error('Error loading transfer requests:', error);
      toast.error('Failed to load transfer requests');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      await approveTransfer(requestId);
      toast.success('Transfer approved successfully');
      await loadTransferRequests();
    } catch (error: any) {
      console.error('Error approving transfer:', error);
      toast.error(error.message || 'Failed to approve transfer');
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleDecline = async () => {
    if (!selectedRequest || !declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }
    
    try {
      setActionLoading(selectedRequest.id);
      await declineTransfer(selectedRequest.id, declineReason);
      toast.success('Transfer declined successfully');
      setShowDeclineDialog(false);
      setDeclineReason('');
      setSelectedRequest(null);
      await loadTransferRequests();
    } catch (error: any) {
      console.error('Error declining transfer:', error);
      toast.error(error.message || 'Failed to decline transfer');
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleCancel = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      await cancelTransfer(requestId);
      toast.success('Transfer cancelled successfully');
      await loadTransferRequests();
    } catch (error: any) {
      console.error('Error cancelling transfer:', error);
      toast.error(error.message || 'Failed to cancel transfer');
    } finally {
      setActionLoading(null);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      pending: 'default',
      approved: 'default',
      declined: 'destructive',
      cancelled: 'outline'
    } as const;
    
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const renderRequestCard = (request: TransferRequest, isOutgoing: boolean) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {request.request_type === 'student' ? (
                <GraduationCap className="h-5 w-5 text-blue-600" />
              ) : (
                <User className="h-5 w-5 text-green-600" />
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {request.entity_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {request.current_id}
                </p>
              </div>
              {getStatusIcon(request.status)}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="font-medium">From:</span>
                <span>{request.from_campus_name} ({request.from_shift === 'M' ? 'Morning' : 'Evening'})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="font-medium">To:</span>
                <span>{request.to_campus_name} ({request.to_shift === 'M' ? 'Morning' : 'Evening'})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Requested:</span>
                <span>{new Date(request.requested_date).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Reason:</span> {request.reason}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusBadge(request.status)}
                {request.decline_reason && (
                  <Badge variant="outline" className="text-red-600">
                    {request.decline_reason}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowDetails(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                
                {/* Action buttons based on status and direction */}
                {isOutgoing ? (
                  // Outgoing requests - can cancel if pending
                  request.status === 'pending' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  )
                ) : (
                  // Incoming requests - can approve/decline if pending
                  request.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === request.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDeclineDialog(true);
                        }}
                        disabled={actionLoading === request.id}
                      >
                        Decline
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transfer requests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transfer Management</h1>
              <p className="text-gray-600">Manage student and teacher transfers</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/admin/principal/transfers/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Transfer
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="outgoing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outgoing">
              Outgoing Requests ({outgoingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="incoming">
              Incoming Requests ({incomingRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="outgoing" className="space-y-4">
            {outgoingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">No outgoing requests</p>
                    <p className="text-sm">You haven't created any transfer requests yet.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {outgoingRequests.map(request => renderRequestCard(request, true))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="incoming" className="space-y-4">
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">No incoming requests</p>
                    <p className="text-sm">No transfer requests have been sent to you yet.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {incomingRequests.map(request => renderRequestCard(request, false))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Request Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transfer Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Type</Label>
                    <p className="text-sm">
                      {selectedRequest.request_type === 'student' ? 'Student Transfer' : 'Teacher Transfer'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Entity</Label>
                  <p className="text-sm font-medium">{selectedRequest.entity_name}</p>
                  <p className="text-xs text-gray-600">{selectedRequest.current_id}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">From</Label>
                    <p className="text-sm">
                      {selectedRequest.from_campus_name} ({selectedRequest.from_shift === 'M' ? 'Morning' : 'Evening'})
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">To</Label>
                    <p className="text-sm">
                      {selectedRequest.to_campus_name} ({selectedRequest.to_shift === 'M' ? 'Morning' : 'Evening'})
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reason</Label>
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
                
                {selectedRequest.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Notes</Label>
                    <p className="text-sm">{selectedRequest.notes}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Requested Date</Label>
                    <p className="text-sm">{new Date(selectedRequest.requested_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created</Label>
                    <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedRequest.decline_reason && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Decline Reason</Label>
                    <p className="text-sm text-red-600">{selectedRequest.decline_reason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Decline Dialog */}
        <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Decline Transfer Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Are you sure you want to decline this transfer request? This action cannot be undone.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="decline_reason">Reason for declining *</Label>
                <Textarea
                  id="decline_reason"
                  placeholder="Please provide a reason for declining this transfer..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeclineDialog(false);
                    setDeclineReason('');
                    setSelectedRequest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDecline}
                  disabled={!declineReason.trim() || actionLoading === selectedRequest?.id}
                >
                  {actionLoading === selectedRequest?.id ? 'Declining...' : 'Decline Transfer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
