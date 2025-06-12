from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os

load_dotenv()

app = Flask(__name__, static_url_path='/static')
CORS(app)

API_KEY = os.getenv("GROQ_API_KEY")

@app.route("/api/chat", methods=["POST"])
def chat():
    user_msg = request.json.get("message")

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "qwen/qwen3-32b",
        "messages": [
            {"role": "user", "content": user_msg}
        ]
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        reply = response.json()["choices"][0]["message"]["content"]
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": f"[Erreur serveur] {str(e)}"}), 500

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/static/<path:path>")
def static_files(path):
    return send_from_directory("static", path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)