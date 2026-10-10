
const $ = id => document.getElementById(id);

const moodData = {
    Happy: {
        plant: "🌻", color: "#f4d778",
        title: "Let your happiness bloom!",
        text: "Enjoy the little things. You deserve moments of joy, laughter, and peace."
    },
    Calm: {
        plant: "🍀", color: "#8ed5a0",
        title: "You can slow down.",
        text: "You don't have to rush through life. Take a gentle breath and be here for a moment."
    },
    Sad: {
        plant: "🌷", color: "#c5a6ec",
        title: "It's okay not to be okay. 💚",
        text: "Even flowers need rainy days. You don't have to be strong every second. Be gentle with yourself, and take one tiny step at a time."
    },
    Stressed: {
        plant: "🌿", color: "#9ad8c1",
        title: "Hey, let's take a little pause.",
        text: "Life isn't a race. Relax your shoulders, breathe comfortably, and focus on just one small thing at a time."
    },
    Focused: {
        plant: "🌵", color: "#a7c7ec",
        title: "One step at a time.",
        text: "You don't need to do everything today. Small, consistent efforts can take you a long way."
    },
    Hopeful: {
        plant: "🌸", color: "#f2a9c7",
        title: "There is still room to bloom.",
        text: "Your story is still unfolding. Keep learning, keep trying, and give yourself permission to begin again."
    }
};

const plantRules = [
    {
        words: ["suicide", "kill myself", "end my life", "want to die"],
        plant: "🫂", name: "Care & Support"
    },
    {
        words: ["sad", "cry", "lonely", "alone", "hurt", "heartbreak", "pain", "upset", "depressed"],
        plant: "🌷", name: "Healing Flower"
    },
    {
        words: ["stress", "stressed", "anxious", "anxiety", "worry", "worried", "pressure", "overwhelmed", "tired"],
        plant: "🍀", name: "Peace Clover"
    },
    {
        words: ["happy", "joy", "smile", "grateful", "thankful", "celebrate"],
        plant: "🌻", name: "Sunshine Bloom"
    },
    {
        words: ["study", "exam", "coding", "learn", "goal", "career", "project", "future", "college"],
        plant: "🌱", name: "Dream Sprout"
    },
    {
        words: ["love", "friend", "family", "kindness", "care"],
        plant: "🌹", name: "Kindness Rose"
    }
];

let selectedMood = "Happy";
let thoughts = [];
let chatHistory = [];

function safeRead(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function safeSave(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        showToast("Browser storage is full. Some changes may not be saved.");
        return false;
    }
}

// DEMO LOGIN: format check only, NOT real authentication.
$("loginForm").addEventListener("submit", event => {
    event.preventDefault();

    const email = $("email").value.trim();
    const password = $("password").value;
    const error = $("loginError");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        error.textContent = "Please enter a valid email address.";
        return;
    }

    if (!/^\d{6,}$/.test(password)) {
        error.textContent = "Wrong password format. Enter at least 6 digits.";
        return;
    }

    // Never store the password.
    sessionStorage.setItem("echoDemoLogin", "true");
    sessionStorage.setItem("echoDemoEmail", email);

    error.textContent = "";
    openApp();
});

function openApp() {
    $("loginPage").hidden = true;
    $("appPage").hidden = false;

    const email = sessionStorage.getItem("echoDemoEmail") || "";
    const firstName = email.split("@")[0];

    if (firstName) {
        $("chatMessages").firstElementChild.textContent =
            `Hey, ${firstName}! 🌿 I'm Little Leaf, your demo chat companion. ` +
            "You can share what's on your mind, talk about your day, or ask for some encouragement. Where would you like to begin?";
    }

    loadUserData();
}

$("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("echoDemoLogin");
    sessionStorage.removeItem("echoDemoEmail");
    $("appPage").hidden = true;
    $("loginPage").hidden = false;
    $("password").value = "";
    $("loginError").textContent = "";
});

// Mood and garden
function getPlant(text) {
    const lower = text.toLowerCase();

    for (const rule of plantRules) {
        if (rule.words.some(word => lower.includes(word))) {
            return rule;
        }
    }

    return {
        plant: moodData[selectedMood].plant,
        name: selectedMood + " Bloom"
    };
}

function animateComfort() {
    const visual = $("comfortPlant");
    visual.classList.remove("bloom");
    void visual.offsetWidth;
    visual.classList.add("bloom");
}

function selectMood(name) {
    selectedMood = name;
    const data = moodData[name];

    document.querySelectorAll(".mood").forEach(button => {
        button.classList.toggle("active", button.dataset.mood === name);
    });

    $("comfortPlant").textContent = data.plant;
    $("comfortPlant").style.setProperty("--unused", data.color);
    $("comfortTitle").textContent = data.title;
    $("comfortText").textContent = data.text;
    $("comfortLabel").textContent = name.toUpperCase() + " MOMENT";
    $("comfort").style.background =
        `linear-gradient(120deg, ${data.color}35, var(--card))`;

    animateComfort();
}

document.querySelectorAll(".mood").forEach(button => {
    button.addEventListener("click", () => selectMood(button.dataset.mood));
});

$("plantBtn").addEventListener("click", () => {
    const text = $("thought").value.trim();

    if (!text) {
        $("thoughtMessage").textContent = "Write a thought first 🌱";
        return;
    }

    const plant = getPlant(text);

    const entry = {
        id: Date.now() + Math.random(),
        text,
        mood: selectedMood,
        plant: plant.plant,
        plantName: plant.name,
        date: new Date().toLocaleString()
    };

    thoughts.unshift(entry);

    if (!safeSave("echoGardenThoughts", thoughts)) {
        thoughts.shift();
        return;
    }

    $("thought").value = "";
    $("thoughtMessage").textContent =
        `${plant.plant} Your ${plant.name} is growing!`;

    renderGarden();
    renderJournal();

    $("comfortPlant").textContent = plant.plant;
    $("comfortTitle").textContent = plant.name + " is blooming!";
    $("comfortText").textContent =
        "Your thoughts deserve a place to grow. Take things one moment at a time.";
    animateComfort();
});

function renderGarden() {
    const garden = $("garden");
    garden.replaceChildren();

    $("count").textContent = thoughts.length;
    $("level").textContent =
        thoughts.length >= 15 ? "Flourishing" :
            thoughts.length >= 8 ? "Blooming" :
                thoughts.length >= 3 ? "Growing" : "Beginner";

    if (!thoughts.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Your first seed is waiting here. 🌱";
        garden.appendChild(empty);
        return;
    }

    thoughts.forEach((item, index) => {
        const plant = document.createElement("div");
        plant.className = "plant";
        plant.style.animationDelay = Math.min(index * 0.06, 0.4) + "s";

        const emoji = document.createElement("span");
        emoji.className = "emoji";
        emoji.textContent = item.plant || "🌱";

        const label = document.createElement("small");
        label.textContent = item.plantName || item.mood;

        plant.append(emoji, label);
        garden.appendChild(plant);
    });
}

function renderJournal() {
    const journal = $("journal");
    journal.replaceChildren();

    if (!thoughts.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Your saved thoughts will appear here.";
        journal.appendChild(empty);
        return;
    }

    thoughts.forEach(item => {
        const entry = document.createElement("article");
        entry.className = "entry";

        const remove = document.createElement("button");
        remove.className = "delete-btn";
        remove.textContent = "Delete";

        remove.addEventListener("click", () => {
            const old = thoughts;
            thoughts = thoughts.filter(t => t.id !== item.id);

            if (!safeSave("echoGardenThoughts", thoughts)) {
                thoughts = old;
                return;
            }

            renderGarden();
            renderJournal();
        });

        const text = document.createElement("div");
        text.textContent = `${item.plant || "🌱"} ${item.text}`;

        const date = document.createElement("small");
        date.textContent = `${item.plantName || item.mood} · ${item.date}`;

        entry.append(remove, text, date);
        journal.appendChild(entry);
    });
}

$("clearBtn").addEventListener("click", () => {
    if (!thoughts.length || !confirm("Clear all your garden thoughts?")) return;

    const old = thoughts;
    thoughts = [];

    if (!safeSave("echoGardenThoughts", thoughts)) {
        thoughts = old;
        return;
    }

    renderGarden();
    renderJournal();
});

function loadUserData() {
    const stored = safeRead("echoGardenThoughts", []);
    thoughts = Array.isArray(stored) ? stored : [];
    renderGarden();
    renderJournal();
}

// Theme
function updateThemeButton() {
    $("themeBtn").textContent =
        document.body.classList.contains("dark") ? "☀️ Light" : "🌙 Dark";
}

if (localStorage.getItem("echoGardenDark") === "true") {
    document.body.classList.add("dark");
}

updateThemeButton();

$("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "echoGardenDark",
        String(document.body.classList.contains("dark"))
    );
    updateThemeButton();
});

// CHAT COMPANION: rule-based demo, not a real AI model.
function getBotReply(message) {
    const text = message.toLowerCase();

    if (/suicide|kill myself|end my life|want to die|self harm/.test(text)) {
        return "I'm really sorry things feel this painful. You deserve support from a real person right now, not to face this alone. If you might hurt yourself or are in immediate danger, contact local emergency services or go to the nearest emergency department. In India, you can call 112 for emergencies. Could you reach out to someone you trust and stay with them while you get help?";
    }

    if (/hello|hi\b|hey\b|good morning|good evening/.test(text)) {
        return "Hey 💚 I'm glad you came to talk. What's been happening in your world today?";
    }

    if (/sad|cry|lonely|alone|hurt|heartbreak|upset|pain|depressed/.test(text)) {
        return "I'm sorry this feels heavy right now. 💚 You don't have to pretend everything is fine. Would you like to tell me what happened, or would it help more if we just start with one small, comforting step?";
    }

    if (/stress|stressed|anxious|anxiety|worry|worried|pressure|overwhelmed|panic/.test(text)) {
        return "That sounds like a lot to carry. Let's slow things down for a moment. Relax your shoulders and take a gentle, comfortable breath. You don't need to solve everything at once. What's the one thing weighing on you most right now?";
    }

    if (/future|career|job|college|study|exam|coding|fail|failure|success/.test(text)) {
        return "It's understandable to feel uncertain about your future. You don't need the whole path figured out today. Let's make it smaller: what is the one thing you're most concerned about, and what is one tiny step you could take next?";
    }

    if (/friend|friendship|relationship|love|breakup|family/.test(text)) {
        return "Relationships can bring up a lot of feelings. Your feelings deserve to be heard, too. What happened that left you feeling this way?";
    }

    if (/angry|anger|mad|frustrated/.test(text)) {
        return "It sounds like something has really frustrated you. You don't have to react immediately. Give yourself a little space first. What happened, and what part of it bothered you the most?";
    }

    if (/motivat|motivation|give up|can't do|cannot do|hopeless/.test(text)) {
        return "You don't have to feel motivated every day to keep moving forward. 🌱 Rest is allowed, and starting small is still starting. What's one thing you'd like to make a little progress on today?";
    }

    if (/thank/.test(text)) {
        return "You're welcome. 💚 Thank you for sharing a little of your world with me. What else is on your mind?";
    }

    if (/who are you|your name|are you ai/.test(text)) {
        return "I'm Little Leaf, the chat companion inside your EchoGarden demo. I use simple message patterns to respond supportively, but I'm not a real AI model. I'm here to help you reflect and explore your thoughts.";
    }

    if (/what should i do|help me|advice|confused|don't know/.test(text)) {
        return "We can think it through together. You don't have to decide everything immediately. Tell me a little more about the situation: what happened, what matters most to you, and what options are you considering?";
    }

    return "Thank you for telling me. 💚 I want to understand a little better. What part of this has been the hardest for you? You can share it in your own words, one small piece at a time.";
}

function addMessage(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = "bubble " + sender;
    bubble.textContent = text;
    $("chatMessages").appendChild(bubble);
    $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
}

function sendChatMessage(message) {
    const text = message.trim();
    if (!text) return;

    addMessage(text, "user");
    chatHistory.push({ role: "user", text });

    // This demo uses local response patterns, not an external AI service.
    const reply = getBotReply(text);

    chatHistory.push({ role: "bot", text: reply });
    addMessage(reply, "bot");
}

$("chatForm").addEventListener("submit", event => {
    event.preventDefault();

    const input = $("chatInput");
    const message = input.value.trim();
    if (!message) return;

    input.value = "";
    sendChatMessage(message);
});

document.querySelectorAll(".suggestion").forEach(button => {
    button.addEventListener("click", () => {
        sendChatMessage(button.dataset.message);
    });
});

// Show login first on every fresh page load.
$("appPage").hidden = true;
$("loginPage").hidden = false;
selectMood("Happy");
