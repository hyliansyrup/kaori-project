// script.js
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const messageSound = new Audio("static/message.mp3");
const chatList = document.getElementById("chat-list");
const newChatBtn = document.getElementById("new-chat");

let assistantName = "Claude";
let currentChatId = null;
let chats = {}; // Store chats in memory

// Met à jour le nom de l'assistant
const nameInput = document.getElementById("assistant-name");
nameInput.addEventListener("input", (e) => {
  assistantName = e.target.value || "Claude";
  document.querySelectorAll(".bubble.assistant .name").forEach(el => {
    el.textContent = assistantName;
  });
});

// Choix de couleur pastel pour les bulles
const colorButtons = document.querySelectorAll(".color-button");
colorButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    document.documentElement.style.setProperty('--bubble-color', color);
    document.documentElement.style.setProperty('--accent-color', color);
  });
});

// Création d'une nouvelle discussion
newChatBtn.addEventListener("click", () => {
  const id = Date.now();
  chats[id] = [];
  currentChatId = id;
  renderChatList();
  chatBox.innerHTML = "";
});

// Affiche la liste des discussions avec boutons de suppression
function renderChatList() {
  chatList.innerHTML = "";
  Object.keys(chats).forEach(id => {
    const li = document.createElement("li");
    li.textContent = `Chat ${id}`;
    li.addEventListener("click", () => {
      currentChatId = id;
      loadChat(id);
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "×";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      delete chats[id];
      if (currentChatId === id) {
        currentChatId = null;
        chatBox.innerHTML = "";
      }
      renderChatList();
    });

    li.appendChild(delBtn);
    chatList.appendChild(li);
  });
}

function loadChat(id) {
  chatBox.innerHTML = "";
  chats[id].forEach(msg => displayMessage(msg.text, msg.sender));
}

// Affiche un message dans le chat
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

  if (currentChatId) {
    chats[currentChatId].push({ text, sender });
  }
}

// Envoie du message à l’API Flask
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message || currentChatId === null) return;

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
    displayMessage("[Erreur serveur]", "assistant");
  }
});
