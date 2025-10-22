from django.contrib import admin
from .models import TransferRequest, IDHistory

# Simple admin registration first
admin.site.register(TransferRequest)
admin.site.register(IDHistory)
