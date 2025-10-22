from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth.models import User

from .models import TransferRequest, IDHistory
from .serializers import (
    TransferRequestSerializer, 
    TransferRequestCreateSerializer,
    TransferApprovalSerializer,
    IDHistorySerializer,
    IDPreviewSerializer
)
from .services import IDUpdateService
from students.models import Student
from teachers.models import Teacher
from campus.models import Campus


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_transfer_request(request):
    """Create a new transfer request"""
    try:
        # Check if user is a principal
        user_role = getattr(request.user, 'role', '').lower()
        if user_role != 'principal':
            return Response({'error': 'Only principals can create transfer requests'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = TransferRequestCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Find receiving principal before creating the transfer request
            from principals.models import Principal
            receiving_principal = None
            
            try:
                print(f"Looking for principal for campus: {serializer.validated_data['to_campus']}")
                
                receiving_principal_obj = Principal.objects.filter(
                    campus_id=serializer.validated_data['to_campus']
                ).first()
                
                print(f"Found principal: {receiving_principal_obj}")
                
                if receiving_principal_obj:
                    receiving_principal = receiving_principal_obj.user
                    print(f"Set receiving principal to: {receiving_principal_obj.user}")
                else:
                    # If no principal found for destination campus, find any available principal
                    print(f"No principal found for campus {serializer.validated_data['to_campus']}, looking for any principal...")
                    any_principal = Principal.objects.first()
                    if any_principal:
                        receiving_principal = any_principal.user
                        print(f"Set receiving principal to any available principal: {any_principal.user}")
                    else:
                        # Last resort: set to requesting principal
                        receiving_principal = request.user
                        print(f"No principals found at all, set to requesting principal: {request.user}")
                        
            except Exception as e:
                # If error, set to requesting principal
                print(f"Error finding principal: {e}")
                receiving_principal = request.user
                print(f"Set receiving principal to requesting principal due to error: {request.user}")
            
            # Create transfer request with receiving principal
            transfer_request = serializer.save(
                requesting_principal=request.user,
                receiving_principal=receiving_principal,
                status='pending'
            )
            
            print(f"Transfer request created with receiving_principal: {transfer_request.receiving_principal}")
            
            return Response(TransferRequestSerializer(transfer_request).data, 
                          status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_transfer_requests(request):
    """List transfer requests for the current user"""
    try:
        user = request.user
        
        # Get query parameters
        request_type = request.GET.get('type')
        status_filter = request.GET.get('status')
        direction = request.GET.get('direction', 'all')  # all, outgoing, incoming
        
        # Base queryset
        queryset = TransferRequest.objects.all()
        
        # Check if user is a principal
        user_role = getattr(user, 'role', '').lower()
        if user_role != 'principal':
            return Response({'error': 'Only principals can view transfer requests'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Filter by direction
        if direction == 'outgoing':
            queryset = queryset.filter(requesting_principal=user)
        elif direction == 'incoming':
            queryset = queryset.filter(receiving_principal=user)
        # 'all' shows both outgoing and incoming
        
        # Apply filters
        if request_type:
            queryset = queryset.filter(request_type=request_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Serialize and return
        serializer = TransferRequestSerializer(queryset, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transfer_request(request, request_id):
    """Get details of a specific transfer request"""
    try:
        transfer_request = get_object_or_404(TransferRequest, id=request_id)
        
        # Check if user has permission to view this request
        user = request.user
        if not (user == transfer_request.requesting_principal or 
                user == transfer_request.receiving_principal or
                user.is_superuser):
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TransferRequestSerializer(transfer_request)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_transfer(request, request_id):
    """Approve a transfer request"""
    try:
        transfer_request = get_object_or_404(TransferRequest, id=request_id)
        
        # Check if user is the receiving principal
        if request.user != transfer_request.receiving_principal:
            return Response({'error': 'Only the receiving principal can approve transfers'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if request is pending
        if transfer_request.status != 'pending':
            return Response({'error': 'Only pending requests can be approved'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Update IDs based on request type
        if transfer_request.request_type == 'student' and transfer_request.student:
            result = IDUpdateService.update_student_id(
                student=transfer_request.student,
                new_campus=transfer_request.to_campus,
                new_shift=transfer_request.to_shift,
                transfer_request=transfer_request,
                changed_by=request.user,
                reason=f"Transfer approved: {transfer_request.reason}"
            )
            
        elif transfer_request.request_type == 'teacher' and transfer_request.teacher:
            # Determine new role (keep existing role for now)
            new_role = transfer_request.teacher.role
            result = IDUpdateService.update_teacher_id(
                teacher=transfer_request.teacher,
                new_campus=transfer_request.to_campus,
                new_shift=transfer_request.to_shift,
                new_role=new_role,
                transfer_request=transfer_request,
                changed_by=request.user,
                reason=f"Transfer approved: {transfer_request.reason}"
            )
        else:
            return Response({'error': 'Invalid transfer request'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Update transfer request status
        transfer_request.status = 'approved'
        transfer_request.reviewed_at = timezone.now()
        transfer_request.save()
        
        return Response({
            'message': 'Transfer approved successfully',
            'new_id': result['new_id'],
            'transfer_request': TransferRequestSerializer(transfer_request).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_transfer(request, request_id):
    """Decline a transfer request"""
    try:
        transfer_request = get_object_or_404(TransferRequest, id=request_id)
        
        # Check if user is the receiving principal
        if request.user != transfer_request.receiving_principal:
            return Response({'error': 'Only the receiving principal can decline transfers'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if request is pending
        if transfer_request.status != 'pending':
            return Response({'error': 'Only pending requests can be declined'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        serializer = TransferApprovalSerializer(data=request.data)
        if serializer.is_valid():
            # Update transfer request status
            transfer_request.status = 'declined'
            transfer_request.reviewed_at = timezone.now()
            transfer_request.decline_reason = serializer.validated_data.get('reason', '')
            transfer_request.save()
            
            return Response({
                'message': 'Transfer declined successfully',
                'transfer_request': TransferRequestSerializer(transfer_request).data
            })
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_transfer(request, request_id):
    """Cancel a transfer request"""
    try:
        transfer_request = get_object_or_404(TransferRequest, id=request_id)
        
        # Check if user is the requesting principal
        if request.user != transfer_request.requesting_principal:
            return Response({'error': 'Only the requesting principal can cancel transfers'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if request can be cancelled
        if transfer_request.status not in ['draft', 'pending']:
            return Response({'error': 'Only draft or pending requests can be cancelled'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Update transfer request status
        transfer_request.status = 'cancelled'
        transfer_request.save()
        
        return Response({
            'message': 'Transfer cancelled successfully',
            'transfer_request': TransferRequestSerializer(transfer_request).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_id_history(request, entity_type, entity_id):
    """Get ID history for a student or teacher"""
    try:
        # Get the entity
        if entity_type == 'student':
            entity = get_object_or_404(Student, id=entity_id)
        elif entity_type == 'teacher':
            entity = get_object_or_404(Teacher, id=entity_id)
        else:
            return Response({'error': 'Invalid entity type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get ID history
        history = IDHistory.objects.filter(
            entity_type=entity_type,
            **{entity_type: entity}
        ).order_by('-changed_at')
        
        serializer = IDHistorySerializer(history, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_by_old_id(request):
    """Search for entity by old ID"""
    try:
        old_id = request.GET.get('id')
        if not old_id:
            return Response({'error': 'ID parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Search in ID history
        history = IDHistory.objects.filter(old_id=old_id).first()
        if history:
            if history.entity_type == 'student':
                entity = history.student
                current_id = entity.student_id
            else:
                entity = history.teacher
                current_id = entity.employee_code
            
            return Response({
                'found': True,
                'entity_type': history.entity_type,
                'entity_id': entity.id,
                'entity_name': history.entity_name,
                'old_id': old_id,
                'current_id': current_id,
                'history': IDHistorySerializer(history).data
            })
        else:
            return Response({'found': False, 'message': 'No entity found with this old ID'})
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def preview_id_change(request):
    """Preview what an ID change would look like"""
    try:
        old_id = request.data.get('old_id')
        new_campus_code = request.data.get('new_campus_code')
        new_shift = request.data.get('new_shift')
        new_role = request.data.get('new_role')
        
        if not all([old_id, new_campus_code, new_shift]):
            return Response({'error': 'old_id, new_campus_code, and new_shift are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        preview = IDUpdateService.preview_id_change(
            old_id=old_id,
            new_campus_code=new_campus_code,
            new_shift=new_shift,
            new_role=new_role
        )
        
        if preview:
            serializer = IDPreviewSerializer(preview)
            return Response(serializer.data)
        else:
            return Response({'error': 'Invalid ID format'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
