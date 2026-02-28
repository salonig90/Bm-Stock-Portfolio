from django.urls import path
from .views import StaffAPIView, StaffDetailAPIView, LoginAPIView, SignupAPIView

urlpatterns = [
    path('signup/', SignupAPIView.as_view(), name='signup'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('staff/', StaffAPIView.as_view(), name='staff-list-create'),
    path('staff/<int:pk>/', StaffDetailAPIView.as_view(), name='staff-detail'),
]