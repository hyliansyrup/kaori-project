const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// pour l’audio
const messageSound = new Audio("static/message.mp3");

// nom de l’assistant
let assistantName = "Claude";
document.getElementById("assistant-name").addEventListener("input", (e) => {
  assistantName = e.target.value || "Claude";
});

// changer couleur
document.querySelectorAll(".color-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    document.documentElement.style.setProperty("--bubble-color", color);
    document.documentElement.style.setProperty("--accent-color", color);
  });
});

// afficher un message dans le chat
function displayMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble", sender);

  if (sender === "assistant") {
    const name = document.createElement("div");
    name.classList.add("name");
    name.textContent = assistantName;
    bubble.appendChild(name);
  }

  const msg = document.createElement("div");
  msg.textContent = text;
  bubble.appendChild(msg);

  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (sender === "assistant") messageSound.play();
}

// gérer l’envoi de message
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  displayMessage(message, "user");
  userInput.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    displayMessage(data.reply, "assistant");
  } catch (err) {
    console.error("Erreur :", err);
    displayMessage("[Erreur serveur]", "assistant");
  }
});

