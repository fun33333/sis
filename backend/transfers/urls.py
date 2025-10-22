from django.urls import path
from . import views

urlpatterns = [
    # Transfer Request Management
    path('request/', views.create_transfer_request, name='create_transfer_request'),
    path('request/list/', views.list_transfer_requests, name='list_transfer_requests'),
    path('request/<int:request_id>/', views.get_transfer_request, name='get_transfer_request'),
    path('request/<int:request_id>/approve/', views.approve_transfer, name='approve_transfer'),
    path('request/<int:request_id>/decline/', views.decline_transfer, name='decline_transfer'),
    path('request/<int:request_id>/cancel/', views.cancel_transfer, name='cancel_transfer'),
    
    # ID History Management
    path('history/<str:entity_type>/<int:entity_id>/', views.get_id_history, name='get_id_history'),
    path('search-by-old-id/', views.search_by_old_id, name='search_by_old_id'),
    
    # ID Preview
    path('preview-id-change/', views.preview_id_change, name='preview_id_change'),
]

