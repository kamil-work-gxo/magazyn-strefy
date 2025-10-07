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
  // Dodawanie użytkownika
  addUserBtn.addEventListener("click", async () => {
    const name = userNameInput.value.trim();
    if (!name) return alert("Podaj imię i nazwisko!");
    await set(ref(db, "users/" + formatKey(name)), { name, zone: null, online: false });
    userNameInput.value = "";
  });

  // Dodawanie strefy
  addZoneBtn.addEventListener("click", async () => {
    const name = zoneNameInput.value.trim();
    const color = zoneColorInput.value;
    if (!name) return alert("Podaj nazwę strefy!");
    await set(ref(db, "zones/" + name), { color });
    zoneNameInput.value = "";
  });

  // Lista użytkowników
  onValue(ref(db, "users"), (snap) => {
    const users = snap.val() || {};
    usersList.innerHTML = "";
    for (const key in users) {
      const li = document.createElement("li");
      li.className = "mb-1";
      
      const span = document.createElement("span");
      span.textContent = users[key].name;
      li.appendChild(span);

      // Edycja użytkownika
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edytuj";
      editBtn.className = "ml-2 text-yellow-500";
      editBtn.onclick = async () => {
        const newName = prompt("Nowe imię i nazwisko:", users[key].name);
        if (!newName) return;
        const newKey = formatKey(newName);
        // przeniesienie danych pod nowy klucz i usunięcie starego
        await set(ref(db, "users/" + newKey), { ...users[key], name: newName });
        if (newKey !== key) await set(ref(db, "users/" + key), null);
      };
      li.appendChild(editBtn);

      // Usuwanie użytkownika
      const delBtn = document.createElement("button");
      delBtn.textContent = "Usuń";
      delBtn.className = "ml-2 text-red-500";
      delBtn.onclick = async () => {
        if (confirm(`Czy na pewno chcesz usunąć użytkownika "${users[key].name}"?`)) {
          await set(ref(db, "users/" + key), null);
        }
      };
      li.appendChild(delBtn);

      usersList.appendChild(li);
    }
  });

  // Lista stref
  onValue(ref(db, "zones"), (snap) => {
    const zones = snap.val() || {};
    zonesList.innerHTML = "";
    for (const key in zones) {
      const li = document.createElement("li");
      li.className = "mb-1";

      const span = document.createElement("span");
      span.textContent = `${zones[key].name ?? key} (${zones[key].color})`;
      li.appendChild(span);

      // Edycja strefy
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edytuj";
      editBtn.className = "ml-2 text-yellow-500";
      editBtn.onclick = async () => {
        const newName = prompt("Nowa nazwa strefy:", zones[key].name ?? key);
        const newColor = prompt("Nowy kolor (hex):", zones[key].color);
        if (!newName || !newColor) return;
        const newKey = newName;
        await set(ref(db, "zones/" + newKey), { color: newColor, name: newName });
        if (newKey !== key) await set(ref(db, "zones/" + key), null);
      };
      li.appendChild(editBtn);

      // Usuwanie strefy
      const delBtn = document.createElement("button");
      delBtn.textContent = "Usuń";
      delBtn.className = "ml-2 text-red-500";
      delBtn.onclick = async () => {
        if (confirm(`Czy na pewno chcesz usunąć strefę "${zones[key].name ?? key}"?`)) {
          await set(ref(db, "zones/" + key), null);
        }
      };
      li.appendChild(delBtn);

      zonesList.appendChild(li);
    }
  });
}
