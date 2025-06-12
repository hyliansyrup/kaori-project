const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

function displayMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble", sender);
  bubble.textContent = text;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

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
