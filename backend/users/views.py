import re
import unicodedata
import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

import google.generativeai as genai
from google.generativeai import types  # Optionnel : selon ton usage



from .models import Rubrique, UserAccess
from .serializers import RubriqueSerializer, CustomTokenObtainPairSerializer


# Initialisation client Gemini (Google)

genai.configure(api_key="AIzaSyBXTbLoufLYxAB9isGY0N4cuGwVAT1BgXQ")

MODEL = "gemini-2.5-flash-preview-04-17"

BASE_SYSTEM_PROMPT = (
    "Tu es StartupBot, un mentor pour les entrepreneurs à Tunis. "
    "Tu aides à comprendre et exploiter les données de Startup Village. "
    "Sois clair, structuré, et fondé uniquement sur les chiffres et tableaux suivants."
)


SHEET_ID = "1Nuaww7YrCQwOQCSlbfUO0z8Bx7_eEbRYDNXkOwdruzk"


def get_all_sheets_data():
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive"
    ]
    creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
    gs_client = gspread.authorize(creds)
    workbook = gs_client.open_by_key(SHEET_ID)

    all_data = {}
    for sheet in workbook.worksheets():
        sheet_name = sheet.title
        records = sheet.get_all_records()
        df = pd.DataFrame(records)
        all_data[sheet_name] = df
    return all_data


def clean_number(value):
    try:
        value = unicodedata.normalize("NFKD", str(value))
        value = value.replace("\xa0", "").replace("\u202f", "").replace(" ", "")
        value = re.sub(r"[^\d,.-]", "", value)
        return float(value.replace(",", "."))
    except Exception:
        return 0.0


def generate_context(user_data):
    user_role = user_data.get("role", "user")
    context = ""

    if user_role == "commercial":
        context = "📊 Indicateurs commerciaux :\n\n"
        context += f"- 💰 Chiffre d'affaires : {user_data.get('chiffre_d_affaires', 0):.0f} TND\n"
        context += f"- 🧱 Charges fixes : {user_data.get('charges_fixes', 0):.0f} TND\n"
        context += f"- 📦 Charges variables : {user_data.get('charges_variables', 0):.0f} TND\n"
        context += f"- 📈 RBE : {user_data.get('rbe', 0):.0f} TND\n"

    elif user_role == "marketing":
        context = "📊 Indicateurs marketing :\n\n"
        context += f"- 🔵 Facebook\n"
        context += f"- 👁️ Impressions : {user_data.get('fb_impressions', 0):.0f}\n"
        context += f"- 👥 Abonnés : {user_data.get('fb_followers', 0):.0f}\n"
        context += f"- ❤️ Engagement : {user_data.get('fb_engagement', 0):.0f}\n"
        context += f"- 📈 Taux d’engagement : {user_data.get('fb_engagement_rate', 0):.2f}%\n\n"
        context += f"- 🟣 Instagram\n"
        context += f"- 👁️ Vues de profil : {user_data.get('insta_impressions', 0):.0f}\n"
        context += f"- 📊 Portée : {user_data.get('insta_reach', 0):.0f}\n"
        context += f"- 👥 Abonnés : {user_data.get('insta_followers', 0):.0f}\n"
        context += f"- ❤️ Engagement : {user_data.get('insta_engagement', 0):.0f}\n"
        context += f"- 📈 Taux d’engagement : {user_data.get('insta_engagement_rate', 0):.2f}%\n\n"
        context += f"- 🔷 LinkedIn\n"
        context += f"- 👁️ Impressions : {user_data.get('linkedin_impressions', 0):.0f}\n"
        context += f"- 👥 Abonnés : {user_data.get('linkedin_followers', 0):.0f}\n"
        context += f"- ❤️ Engagement : {user_data.get('linkedin_engagement', 0):.0f}\n"
        context += f"- 📈 Taux d’engagement : {user_data.get('linkedin_engagement_rate', 0):.2f}%\n"

    elif user_role == "operationnel":
        context = "📊 Indicateurs opérationnels :\n\n"
        context += f"- 🔎 Enquête de satisfaction client : {user_data.get('satisfaction', '')}\n"
        context += f"- 🏢 Taux d'occupation : {user_data.get('taux_occupation', '')}\n"
        context += f"- 💬 Avis Google : {user_data.get('avis_google', '')}\n"
        context += f"- 🏗️ Indicateurs d'infrastructure : {user_data.get('indicateurs_infrastructure', '')}\n"
        context += f"- 🚫 Indisponibilité du service : {user_data.get('indisponibilite_service', '')}\n"
        context += f"- 👁️ Visite mystère : {user_data.get('visite_mystere', '')}\n"

    elif user_role == "superadmin":
        context = "📊 Accès complet aux données.\n\n"
        context += f"- 💰 Chiffre d'affaires global : {user_data.get('chiffre_d_affaires', 0):.0f} TND\n"
        context += f"- 🧱 Charges fixes globales : {user_data.get('charges_fixes', 0):.0f} TND\n"
        context += f"- 📦 Charges variables globales : {user_data.get('charges_variables', 0):.0f} TND\n"
        context += f"- 📈 RBE global : {user_data.get('rbe', 0):.0f} TND\n"

    else:
        context = "🔐 Vous n'avez pas accès à ces informations."

    return context[:8000]


# Tes vues existantes
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
                "rubrique_powerbi_url": rubrique.powerbi_url,
                "sous_rubriques": []
            }

        if entry.sous_rubrique:
            sous = entry.sous_rubrique
            if sous.slug not in [sr["slug"] for sr in data[rubrique_key]["sous_rubriques"]]:
                data[rubrique_key]["sous_rubriques"].append({
                    "title": sous.title,
                    "slug": sous.slug,
                    "sous_rubrique_powerbi_url": sous.powerbi_url
                })

    result = list(data.values())

    if user.role != 'superadmin' and result:
        result = [result[0]]

    return Response(result)


# La nouvelle vue ChatAPIView avec appel Gemini + contexte + données Sheets
class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message")
        profil = request.data.get("profil")

        if not message or not profil:
            return Response({"error": "Message et profil requis."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user

        try:
            # 1. Récupérer ou simuler les données utilisateur
            # Ici tu pourrais enrichir avec get_all_sheets_data() si tu veux injecter des données sheets
            user_data = {
                "role": user.role,
                "chiffre_d_affaires": 500000,
                "charges_fixes": 200000,
                "charges_variables": 100000,
                "rbe": 200000,
                "fb_impressions": 10000,
                "fb_followers": 5000,
                "fb_engagement": 1200,
                "fb_engagement_rate": 3.4,
                "insta_impressions": 8000,
                "insta_reach": 7000,
                "insta_followers": 3000,
                "insta_engagement": 900,
                "insta_engagement_rate": 4.5,
                "linkedin_impressions": 6000,
                "linkedin_followers": 2000,
                "linkedin_engagement": 600,
                "linkedin_engagement_rate": 2.9,
                "satisfaction": "92%",
                "taux_occupation": "85%",
                "avis_google": "4.3/5",
                "indicateurs_infrastructure": "Fonctionnels",
                "indisponibilite_service": "Basse",
                "visite_mystere": "Satisfaisante",
            }

            # Optionnel : récupérer et injecter les données sheets dans user_data si besoin
            # sheets_data = get_all_sheets_data()
            # Par exemple, tu peux traiter sheets_data ici

            # 2. Générer le contexte selon le profil/role
            context = generate_context(user_data)

            # 3. Construire le prompt complet pour Gemini
            prompt = f"{BASE_SYSTEM_PROMPT}\n\n{context}\n\nQuestion : {message}"

            # 4. Appeler Gemini
            response = genai.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": BASE_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500,
            )

            reply = response.choices[0].message["content"]

            return Response({"reply": reply})

        except Exception as e:
            return Response({"error": f"Erreur serveur: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
