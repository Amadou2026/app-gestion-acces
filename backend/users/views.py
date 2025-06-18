from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView


from django.views.decorators.csrf import csrf_exempt
from .utils import ask_gemini

from .models import Rubrique, SousRubrique, UserAccess
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
    avec title, slug et powerbi_url.
    """
    user = request.user
    access_entries = UserAccess.objects.filter(user=user).select_related('rubrique', 'sous_rubrique')

    data = {}
    for entry in access_entries:
        rubrique = entry.rubrique
        rubrique_key = rubrique.slug

        if rubrique_key not in data:
            data[rubrique_key] = {
                "title": rubrique.title,
                "slug": rubrique.slug,
                "rubrique_powerbi_url": getattr(rubrique, 'powerbi_url', ''),
                "sous_rubriques": []
            }

        if entry.sous_rubrique:
            sous = entry.sous_rubrique
            if sous.slug not in [sr['slug'] for sr in data[rubrique_key]["sous_rubriques"]]:
                data[rubrique_key]["sous_rubriques"].append({
                    "title": sous.title,
                    "slug": sous.slug,
                    "sous_rubrique_powerbi_url": getattr(sous, 'powerbi_url', '')
                })

    result = list(data.values())
    return Response(result)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot_view(request):
    user = request.user
    question = request.data.get("question")

    # Récupération des rubriques et sous-rubriques via UserAccess
    access = UserAccess.objects.filter(user=user).select_related("rubrique", "sous_rubrique")

    # Construction du contexte
    rubrique_titles = set()
    sous_rubrique_titles = set()

    for entry in access:
        if entry.rubrique:
            rubrique_titles.add(entry.rubrique.title)
        if entry.sous_rubrique:
            sous_rubrique_titles.add(entry.sous_rubrique.title)

    rubrique_context_parts = []
    if rubrique_titles:
        rubrique_context_parts.append("Rubriques : " + ", ".join(sorted(rubrique_titles)))
    if sous_rubrique_titles:
        rubrique_context_parts.append("Sous-rubriques : " + ", ".join(sorted(sous_rubrique_titles)))

    rubrique_context = " | ".join(rubrique_context_parts) or "aucune rubrique disponible"

    # Construction du prompt
    prompt = f"L'utilisateur pose une question dans le contexte suivant : {rubrique_context}.\n\nVoici sa question : {question}"

    # Appel à Gemini
    response_text = ask_gemini(prompt, rubrique_context=rubrique_context)
    return Response({"answer": response_text})
