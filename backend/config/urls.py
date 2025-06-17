from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import CustomTokenObtainPairView, user_access_view, ChatAPIView


admin.site.login_template = 'admin/login.html'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # login personnalisé
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # refresh token
    path('api/user-access/', user_access_view, name='user_access'),
    path("api/chat", ChatAPIView.as_view(), name="chat_api"),
    path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
]
