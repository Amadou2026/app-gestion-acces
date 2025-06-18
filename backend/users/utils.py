# mon_app/utils.py

import google.generativeai as genai
from django.conf import settings
from pathlib import Path
import json

# Configuration Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# Modèle et prompt
MODEL = "gemini-2.5-flash-preview-04-17"
HISTORY_FILE = Path("history.json")

BASE_SYSTEM_PROMPT = (
    "Tu es StartupBot, un mentor pour les entrepreneurs à Tunis. "
    "Tu aides à comprendre et exploiter les données de Startup Village. "
    "Sois clair, structuré, et fondé uniquement sur les chiffres et tableaux suivants."
)

def load_history():
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_history(history):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

def ask_gemini(question, rubrique_context=""):
    # Construire le prompt final transmis à Gemini
    full_prompt = (
        f"{BASE_SYSTEM_PROMPT}\n\n"
        f"Contexte : {rubrique_context}\n\n"
        f"Question : {question}"
    )

    # Charger historique
    history = load_history()

    # Appel API Gemini
    model = genai.GenerativeModel(MODEL)
    response = model.generate_content(full_prompt)

    # Sauvegarder dans l'historique
    history.append({"role": "user", "content": full_prompt})
    history.append({"role": "model", "content": response.text})
    save_history(history)

    return response.text
