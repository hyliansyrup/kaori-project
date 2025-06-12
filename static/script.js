let chats = JSON.parse(localStorage.getItem("kaori_chats")) || [];
let activeChatIndex = 0;
let chatCount = chats.length;
const chatList = document.getElementById("chat-list");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const newChatBtn = document.getElementById("new-chat");
const assistantNameInput = document.getElementById("assistant-name");
const colorButtons = document.querySelectorAll(".color-button");
const messageSound = new Audio('static/message.mp3');

colorButtons.forEach(button => {
  button.addEventListener('click', () => {
    const color = button.dataset.color;
    document.documentElement.style.setProperty('--accent-color', color);
    renderMessages();
  });
});

function renderChatList() {
  chatList.innerHTML = "";
  chats.forEach((chat, index) => {
    const li = document.createElement("li");
    li.textContent = chat.name;
    li.classList.toggle("active", index === activeChatIndex);
    li.onclick = () => {
      activeChatIndex = index;
      renderChatList();
      renderMessages();
    };
    li.ondblclick = () => {
      const newName = prompt("Renommer la conversation :", chat.name);
      if (newName) {
        chat.name = newName;
        saveChats();
        renderChatList();
      }
    };
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      chats.splice(index, 1);
      if (activeChatIndex >= chats.length) activeChatIndex = chats.length - 1;
      saveChats();
      renderChatList();
      renderMessages();
    };
    li.appendChild(deleteBtn);
    chatList.appendChild(li);
  });
}

function renderMessages() {
  chatBox.innerHTML = "";
  const assistantName = assistantNameInput.value || "kaori";
  const bubbleColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

  if (!chats[activeChatIndex]) return;

  chats[activeChatIndex].messages.forEach(msg => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("message-wrapper");

    if (msg.sender === "kaori") {
      const label = document.createElement("span");
      label.className = "sender-label";
      label.textContent = assistantName;
      wrapper.appendChild(label);
    }

    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(msg.sender);
    div.textContent = msg.text;
    div.style.backgroundColor = bubbleColor;
    div.style.color = "#000";
    div.classList.add("fade-in");

    if (msg.sender === "user") {
      div.style.alignSelf = "flex-end";
    }

    wrapper.appendChild(div);
    chatBox.appendChild(wrapper);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

function saveChats() {
  localStorage.setItem("kaori_chats", JSON.stringify(chats));
}

chatForm.onsubmit = async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  if (chats.length === 0) {
    chatCount++;
    const name = `nouveau chat ${chatCount}`;
    chats.push({ name, messages: [] });
    activeChatIndex = 0;
    renderChatList();
  }

  chats[activeChatIndex].messages.push({ sender: "user", text });
  renderMessages();
  messageSound.play();
  userInput.value = "";
  saveChats();

  const res = await fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();
  chats[activeChatIndex].messages.push({ sender: "kaori", text: data.reply });
  renderMessages();
  messageSound.play();
  saveChats();
};

newChatBtn.onclick = () => {
  chatCount++;
  const name = `nouveau chat ${chatCount}`;
  chats.push({ name, messages: [] });
  activeChatIndex = chats.length - 1;
  saveChats();
  renderChatList();
  renderMessages();
};

if (chats.length === 0) {
  chats.push({ name: "nouveau chat 1", messages: [] });
  chatCount = 1;
}
renderChatList();
renderMessages();
