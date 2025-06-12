// script.js

const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const messageSound = new Audio("static/message.mp3");
const chatList = document.getElementById("chat-list");
const newChatButton = document.getElementById("new-chat");
const sidebar = document.querySelector(".sidebar");
const sidebarHeader = document.querySelector(".sidebar-header");

let assistantName = "Kaori";
let chats = [];
let currentChatIndex = -1;
let sidebarVisible = true;

const toggleSidebarButton = document.createElement("button");
toggleSidebarButton.id = "toggle-sidebar";
toggleSidebarButton.textContent = "☰";
toggleSidebarButton.title = "Afficher/Masquer la barre";
toggleSidebarButton.classList.add("rotate");
document.body.appendChild(toggleSidebarButton);

function saveChats() {
  localStorage.setItem("kaori_chats", JSON.stringify(chats));
}

function loadChats() {
  const saved = localStorage.getItem("kaori_chats");
  if (saved) chats = JSON.parse(saved);
}

function updateChatList() {
  chatList.innerHTML = "";
  chats.forEach((chat, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>Discussion ${index + 1}</span> <button onclick="deleteChat(${index})">✕</button>`;
    li.onclick = () => switchChat(index);
    chatList.appendChild(li);
  });
}

function deleteChat(index) {
  chats.splice(index, 1);

  if (currentChatIndex === index) {
    chatBox.innerHTML = "";
    if (chats.length === 0) {
      // crée une nouvelle discussion automatiquement
      chats.push([]);
      currentChatIndex = 0;
    } else {
      currentChatIndex = 0;
    }
  } else if (currentChatIndex > index) {
    currentChatIndex--;
  }

  saveChats();
  updateChatList();
  if (chats[currentChatIndex]) {
    chatBox.innerHTML = "";
    chats[currentChatIndex].forEach(msg => displayMessage(msg.text, msg.sender));
  }
}


function switchChat(index) {
  currentChatIndex = index;
  chatBox.innerHTML = "";
  chats[index].forEach(msg => displayMessage(msg.text, msg.sender));
}

newChatButton.onclick = () => {
  chats.push([]);
  currentChatIndex = chats.length - 1;
  chatBox.innerHTML = "";
  saveChats();
  updateChatList();
};

document.getElementById("assistant-name").addEventListener("input", (e) => {
  assistantName = e.target.value || "Kaori";
  document.querySelectorAll(".bubble.assistant .name").forEach(el => {
    el.textContent = assistantName;
  });
});

document.querySelectorAll(".color-button").forEach(btn => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    document.documentElement.style.setProperty('--bubble-color', color);
    document.documentElement.style.setProperty('--accent-color', color);
  });
});

function cleanResponse(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

function formatText(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function displayMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble", sender);

  if (sender === "assistant") {
    const name = document.createElement("div");
    name.classList.add("name");
    name.textContent = assistantName;
    bubble.appendChild(name);
    text = cleanResponse(text);
  }

  const messageText = document.createElement("div");
  messageText.innerHTML = formatText(text);
  bubble.appendChild(messageText);

  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (sender === "assistant") messageSound.play();

  if (currentChatIndex >= 0) {
    chats[currentChatIndex].push({ text, sender });
    saveChats();
  }
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  if (currentChatIndex < 0) {
    chats.push([]);
    currentChatIndex = chats.length - 1;
    updateChatList();
  }

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

toggleSidebarButton.onclick = () => {
  sidebarVisible = !sidebarVisible;
  sidebar.style.display = sidebarVisible ? "flex" : "none";
  toggleSidebarButton.classList.toggle("rotated", !sidebarVisible);
  toggleSidebarButton.style.position = "fixed";
  toggleSidebarButton.style.top = "10px";
  toggleSidebarButton.style.left = sidebarVisible ? "270px" : "10px";
};

loadChats();
updateChatList();

document.getElementById("toggle-theme").addEventListener("change", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  const textColor = isDark ? "white" : "black";

  // met à jour la couleur de texte dans toutes les bulles
  document.querySelectorAll(".bubble").forEach(b => {
    b.style.color = textColor;
  });

  // met à jour le texte global (si jamais utilisé ailleurs)
  document.documentElement.style.setProperty('--text-color', textColor);

  // met aussi à jour les inputs si besoin
  document.querySelectorAll('input[type="text"], .assistant-settings input').forEach(el => {
    el.style.color = textColor;
    el.style.backgroundColor = isDark ? "#1a1a1a" : "#fff";
    el.style.borderColor = isDark ? "#555" : "#ccc";
  });

  // met à jour le fond du formulaire
  const form = document.querySelector("form");
  if (form) {
    form.style.backgroundColor = isDark ? "#2a2a2a" : "#fafafa";
    form.style.borderTop = isDark ? "1px solid #444" : "1px solid #ddd";
  }

  // met à jour la sidebar
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.style.backgroundColor = isDark ? "#1f1f1f" : "#f2f2f2";
    sidebar.style.borderRight = isDark ? "1px solid #444" : "1px solid #ccc";
  }

  // met à jour les éléments de la liste des discussions
  document.querySelectorAll("#chat-list li").forEach(li => {
    li.style.backgroundColor = isDark ? "#2a2a2a" : "#fff";
    li.style.color = textColor;
  });
});
