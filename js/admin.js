import { db, ref, set, get, update, onValue } from "../firebase-config.js";

const urlParams = new URLSearchParams(window.location.search);
const key = urlParams.get("key");
const SECRET_KEY = "sekret123"; // zmień na swoje

const adminPanel = document.getElementById("adminPanel");
const auth = document.getElementById("auth");
const addUserBtn = document.getElementById("addUser");
const addZoneBtn = document.getElementById("addZone");
const userNameInput = document.getElementById("userName");
const zoneNameInput = document.getElementById("zoneName");
const zoneColorInput = document.getElementById("zoneColor");
const usersList = document.getElementById("usersList");
const zonesList = document.getElementById("zonesList");

if (key === SECRET_KEY) {
  auth.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  init();
}

function formatKey(name) {
  return name.toLowerCase().replace(/\s+/g, "_");
}

function init() {
  addUserBtn.addEventListener("click", async () => {
    const name = userNameInput.value.trim();
    if (!name) return;
    await set(ref(db, "users/" + formatKey(name)), { name, zone: null, online: false });
    userNameInput.value = "";
  });

  addZoneBtn.addEventListener("click", async () => {
    const name = zoneNameInput.value.trim();
    const color = zoneColorInput.value;
    if (!name) return;
    await set(ref(db, "zones/" + name), { color });
    zoneNameInput.value = "";
  });

  // Lista użytkowników
  onValue(ref(db, "users"), (snap) => {
    const users = snap.val() || {};
    usersList.innerHTML = "";
    for (const key in users) {
      const li = document.createElement("li");
      li.textContent = users[key].name;
      const btn = document.createElement("button");
      btn.textContent = "Usuń";
      btn.className = "ml-2 text-red-500";
      btn.onclick = () => set(ref(db, "users/" + key), null);
      li.appendChild(btn);
      usersList.appendChild(li);
    }
  });

  // Lista stref
  onValue(ref(db, "zones"), (snap) => {
    const zones = snap.val() || {};
    zonesList.innerHTML = "";
    for (const key in zones) {
      const li = document.createElement("li");
      li.textContent = `${key} (${zones[key].color})`;
      const btn = document.createElement("button");
      btn.textContent = "Usuń";
      btn.className = "ml-2 text-red-500";
      btn.onclick = () => set(ref(db, "zones/" + key), null);
      li.appendChild(btn);
      zonesList.appendChild(li);
    }
  });
}
