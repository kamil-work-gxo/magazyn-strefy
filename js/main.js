import { db, ref, get, onValue, update } from "../firebase-config.js";

// elementy DOM
const loginDiv = document.getElementById("login");
const appDiv = document.getElementById("app");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userZone = document.getElementById("userZone");
const zoneUsers = document.getElementById("zoneUsers");
const loggedAs = document.getElementById("loggedAs");

let currentUser = localStorage.getItem("username");

// 🔹 czekamy aż DOM się załaduje
document.addEventListener("DOMContentLoaded", () => {
  if (currentUser) {
    if (loggedAs) loggedAs.textContent = `Zalogowany jako: ${currentUser}`;
    showApp(currentUser);
  }
});

// logowanie – tylko istniejący użytkownicy
loginBtn.addEventListener("click", async () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Podaj imię i nazwisko!");

  const userRef = ref(db, "users/" + formatKey(name));
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    return alert("Użytkownik nie istnieje. Skontaktuj się z administratorem.");
  }

  const user = snapshot.val();
  if (loggedAs) loggedAs.textContent = `Zalogowany jako: ${user.name}`;

  try {
    await update(userRef, { online: true });
  } catch (err) {
    console.error("Błąd przy ustawianiu online:", err);
  }

  localStorage.setItem("username", name);
  showApp(name);
});

// wylogowanie – czyści online i strefę
logoutBtn.addEventListener("click", async () => {
  const name = localStorage.getItem("username");
  if (name) {
    await update(ref(db, "users/" + formatKey(name)), { online: false, zone: null });
  }
  localStorage.removeItem("username");
  if (loggedAs) loggedAs.textContent = "";
  location.reload();
});

// formatowanie klucza Firebase
function formatKey(name) {
  return name.toLowerCase().replace(/\s+/g, "_");
}

// pokazanie aplikacji po zalogowaniu
function showApp(name) {
  loginDiv.classList.add("hidden");
  appDiv.classList.remove("hidden");
  currentUser = name;

  if (loggedAs) loggedAs.textContent = `Zalogowany jako: ${name}`;

  const userRef = ref(db, "users/" + formatKey(name));

  onValue(userRef, (snap) => {
    const data = snap.val();
    if (!data) return;
    const zone = data.zone;
    userZone.textContent = zone ? zone : "Nie przypisano do strefy";
    loadZoneUsers(zone);
  });

  // ustaw offline przy zamknięciu strony
  window.addEventListener("beforeunload", async () => {
    const name = localStorage.getItem("username");
    if (name) {
      await update(ref(db, "users/" + formatKey(name)), { online: false });
    }
  });
}

// wczytanie użytkowników ze strefy
function loadZoneUsers(zone) {
  if (!zone) {
    zoneUsers.innerHTML = "<li>Brak przypisania</li>";
    return;
  }

  const usersRef = ref(db, "users");
  onValue(usersRef, (snap) => {
    const users = snap.val();
    if (!users) {
      zoneUsers.innerHTML = "<li>Brak użytkowników w strefie</li>";
      return;
    }

    const list = Object.values(users).filter(u => u.zone === zone);
    zoneUsers.innerHTML = list.length
      ? list.map(u => `<li>${u.name}</li>`).join("")
      : "<li>Brak użytkowników w strefie</li>";
  });
}
