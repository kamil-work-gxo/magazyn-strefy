import { db, ref, set, get, update, onValue } from "../firebase-config.js";

const urlParams = new URLSearchParams(window.location.search);
const key = urlParams.get("key");
const SECRET_KEY = "sekret123"; // zmień na swoje

const adminPanel = document.getElementById("adminPanel");
const auth = document.getElementById("auth");
const usersTable = document.getElementById("usersTable");
const addUserBtn = document.getElementById("addUser");
const addZoneBtn = document.getElementById("addZone");
const userNameInput = document.getElementById("userName");
const zoneNameInput = document.getElementById("zoneName");
const zoneColorInput = document.getElementById("zoneColor");
const statsDiv = document.getElementById("stats");

if (key === SECRET_KEY) {
  auth.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  init();
}

function formatKey(name) {
  return name.toLowerCase().replace(/\s+/g, "_");
}

async function init() {
  addUserBtn.addEventListener("click", async () => {
    const name = userNameInput.value.trim();
    if (!name) return;
    await set(ref(db, "users/" + formatKey(name)), { name, zone: null });
    userNameInput.value = "";
  });

  addZoneBtn.addEventListener("click", async () => {
    const name = zoneNameInput.value.trim();
    const color = zoneColorInput.value;
    if (!name) return;
    await set(ref(db, "zones/" + name), { color });
    zoneNameInput.value = "";
  });

  onValue(ref(db, "users"), (snap) => {
    const users = snap.val() || {};
    renderUsers(users);
  });

  onValue(ref(db, "zones"), (snap) => {
    const zones = snap.val() || {};
    renderZones(zones);
  });
}

function renderUsers(users) {
  const usersArray = Object.values(users);
  const total = usersArray.length;
  const assigned = usersArray.filter(u => u.zone).length;
  const unassigned = total - assigned;

  statsDiv.innerHTML = `
    <p>Łącznie użytkowników: ${total}</p>
    <p>Przypisani do stref: ${assigned}</p>
    <p>Nieprzypisani: ${unassigned}</p>
  `;

  usersTable.innerHTML = "";
  for (const key in users) {
    const u = users[key];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${u.name}</td>
      <td class="border p-2">${u.zone ?? "-"}</td>
      <td class="border p-2">
        <select class="border rounded p-1 zoneSelect" data-user="${key}">
          <option value="">---</option>
        </select>
      </td>
    `;
    usersTable.appendChild(tr);
  }

  updateZoneDropdowns();
}

function renderZones(zones) {
  const selects = document.querySelectorAll(".zoneSelect");
  selects.forEach(sel => {
    sel.innerHTML = '<option value="">---</option>';
    for (const [name, z] of Object.entries(zones)) {
      sel.innerHTML += `<option value="${name}" style="background:${z.color}">${name}</option>`;
    }
    sel.addEventListener("change", async (e) => {
      const userKey = e.target.dataset.user;
      const zone = e.target.value || null;
      await update(ref(db, "users/" + userKey), { zone });
    });
  });
}
