const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const messageSound = new Audio("static/message.mp3");

let assistantName = "Claude";

// changement du nom de l’assistant
document.getElementById("assistant-name").addEventListener("input", (e) => {
  assistantName = e.target.value || "Claude";
  document.querySelectorAll(".bubble.assistant .name").forEach(el => {
    el.textContent = assistantName;
  });
});

// changement de couleurs instantané
document.querySelectorAll(".color-button").forEach(btn => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    document.documentElement.style.setProperty('--bubble-color', color);
    document.documentElement.style.setProperty('--accent-color', color);
  });
});

// afficher un message
function displayMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble", sender);

  if (sender === "assistant") {
    const name = document.createElement("div");
    name.classList.add("name");
    name.textContent = assistantName;
    bubble.appendChild(name);
  }

  const messageText = document.createElement("div");
  messageText.textContent = text;
  bubble.appendChild(messageText);

  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (sender === "assistant") messageSound.play();
}

// envoyer un message
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
