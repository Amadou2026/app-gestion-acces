from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Rubrique, UserAccess
from .serializers import RubriqueSerializer, CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RubriqueViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RubriqueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'superadmin':
            return Rubrique.objects.all()
        else:
            access_rubriques_ids = UserAccess.objects.filter(user=user).values_list('rubrique_id', flat=True).distinct()
            return Rubrique.objects.filter(id__in=access_rubriques_ids)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_access_view(request):
    """
    Retourne les rubriques et sous-rubriques accessibles à l'utilisateur connecté,
    avec title et slug.
    """
    user = request.user
    access_entries = UserAccess.objects.filter(user=user).select_related('rubrique', 'sous_rubrique')

    data = {}
    for entry in access_entries:
        rubrique = entry.rubrique
        rubrique_key = rubrique.slug  # ou rubrique.title, mais mieux le slug pour clé unique
        if rubrique_key not in data:
            data[rubrique_key] = {
                "title": rubrique.title,
                "slug": rubrique.slug,
                "sous_rubriques": []
            }
        if entry.sous_rubrique:
            sous = entry.sous_rubrique
            # éviter doublons sous-rubriques
            if sous.slug not in [sr['slug'] for sr in data[rubrique_key]["sous_rubriques"]]:
                data[rubrique_key]["sous_rubriques"].append({
                    "title": sous.title,
                    "slug": sous.slug
                })

    # On retourne une liste
    result = list(data.values())
    return Response(result)
