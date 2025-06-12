from flask import Flask, request, jsonify, send_from_directory
import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

app = Flask(__name__, static_folder='static')

@app.route("/")
def index():
    return send_from_directory('.', 'index.html')

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    user_input = data.get("message", "")

    if not user_input:
        return jsonify({"reply": "dis-moi un truc 👀"})

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "anthropic/claude-3-haiku",
                "messages": [
                    {
                        "role": "system",
                        "content": "tu es chill, toujours en minuscule, et tu parles comme un bon ami. tu tutoies toujours. tu ne te présentes jamais. tu restes simple, directe et naturelle. pas de blabla, pas de robotisme. tu t'adaptes au style de l'utilisateur. tu peux être drôle ou cash si c'est le ton."
                    },
                    {
                        "role": "user",
                        "content": user_input
                    }
                ]
            }
        )

        data = response.json()

        if "error" in data:
            return jsonify({"reply": f"[Erreur OpenRouter] {data['error']['message']}"})

        reply = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

        if not reply:
            return jsonify({"reply": "[Erreur] Réponse vide ou incompréhensible."})

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"reply": f"[Erreur serveur] {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)
