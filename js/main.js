import { db, ref, get, onValue, set, update } from "../firebase-config.js";

// elementy DOM
const loginDiv = document.getElementById("login");
const appDiv = document.getElementById("app");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userZone = document.getElementById("userZone");
const zoneUsers = document.getElementById("zoneUsers");

let currentUser = localStorage.getItem("username");

// jeśli użytkownik jest w localStorage, pokaz aplikację
if (currentUser) {
  showApp(currentUser);
}

// logowanie
loginBtn.addEventListener("click", async () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Podaj imię i nazwisko!");

  localStorage.setItem("username", name);
  await ensureUserExists(name);
  showApp(name);
});

// wylogowanie
logoutBtn.addEventListener("click", async () => {
  const name = localStorage.getItem("username");
  if (name) {
    // ustawiamy online = false i czyścimy strefę
    await update(ref(db, "users/" + formatKey(name)), { online: false, zone: null });
  }
  localStorage.removeItem("username");
  location.reload();
});

// upewnienie się, że użytkownik istnieje w bazie i ustawienie online = true
async function ensureUserExists(name) {
  const userRef = ref(db, "users/" + formatKey(name));
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    await set(userRef, { name: name, zone: null, online: true });
  } else {
    await update(userRef, { online: true });
  }
}

// formatowanie nazwy użytkownika na klucz w Firebase
function formatKey(name) {
  return name.toLowerCase().replace(/\s+/g, "_");
}

// pokazanie aplikacji po zalogowaniu
function showApp(name) {
  loginDiv.classList.add("hidden");
  appDiv.classList.remove("hidden");
  currentUser = name;

  const userRef = ref(db, "users/" + formatKey(name));

  // nasłuchiwanie zmian użytkownika
  onValue(userRef, (snap) => {
    const data = snap.val();
    if (!data) return;

    const zone = data.zone;
    userZone.textContent = zone ? zone : "Nie przypisano do strefy";

    loadZoneUsers(zone);
  });

  // ustawienie offline przy zamknięciu strony
  window.addEventListener("beforeunload", async () => {
    await update(ref(db, "users/" + formatKey(name)), { online: false });
  });
}

// wczytanie wszystkich użytkowników przypisanych do tej samej strefy
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
