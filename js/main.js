import { db, ref, get, onValue, set, update } from "../firebase-config.js";

const loginDiv = document.getElementById("login");
const appDiv = document.getElementById("app");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userZone = document.getElementById("userZone");
const zoneUsers = document.getElementById("zoneUsers");

let currentUser = localStorage.getItem("username");

if (currentUser) {
  showApp(currentUser);
}

loginBtn.addEventListener("click", async () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Podaj imię i nazwisko!");

  localStorage.setItem("username", name);
  await ensureUserExists(name);
  showApp(name);
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("username");
  location.reload();
});

async function ensureUserExists(name) {
  const userRef = ref(db, "users/" + formatKey(name));
  const snapshot = await get(userRef);
  if (!snapshot.exists()) {
    await set(userRef, { name: name, zone: null });
  }
}

function formatKey(name) {
  return name.toLowerCase().replace(/\s+/g, "_");
}

function showApp(name) {
  loginDiv.classList.add("hidden");
  appDiv.classList.remove("hidden");
  const userRef = ref(db, "users/" + formatKey(name));

  onValue(userRef, (snap) => {
    const data = snap.val();
    if (!data) return;
    const zone = data.zone;
    userZone.textContent = zone ? zone : "Nie przypisano do strefy";
    loadZoneUsers(zone);
  });
}

function loadZoneUsers(zone) {
  if (!zone) {
    zoneUsers.innerHTML = "<li>Brak przypisania</li>";
    return;
  }

  const usersRef = ref(db, "users");
  onValue(usersRef, (snap) => {
    const users = snap.val();
    const list = Object.values(users).filter(u => u.zone === zone);
    zoneUsers.innerHTML = list.map(u => `<li>${u.name}</li>`).join("");
  });
}
