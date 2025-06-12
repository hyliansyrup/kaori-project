from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")

app = Flask(__name__)

@app.route("/api/chat", methods=["POST"])
def chat():
    user_input = request.json["message"]

    payload = {
        "model": "anthropic/claude-3-haiku",
        "messages": [{"role": "user", "content": user_input}]
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",   # ← très important !
        "Content-Type": "application/json"
    }

    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
    data = response.json()
    return jsonify({"reply": data["choices"][0]["message"]["content"]})
