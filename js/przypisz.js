import { db, ref, update, onValue, get } from "../firebase-config.js";

const loggedUsersTable = document.getElementById("loggedUsersTable");
const statsDiv = document.getElementById("stats");

let zonesData = {};
let usersData = {};

// Nasłuch stref
onValue(ref(db, "zones"), (snap) => {
  zonesData = snap.val() || {};
  renderTable();
});

// Nasłuch użytkowników
onValue(ref(db, "users"), (snap) => {
  usersData = snap.val() || {};
  renderTable();
});

function renderTable() {
  if (!usersData || !zonesData) return;

  // podział użytkowników: nieprzypisani i przypisani
  const loggedUsers = Object.entries(usersData).filter(([k,u])=> u.online);
  const unassigned = loggedUsers.filter(([k,u]) => !u.zone);
  const assigned = loggedUsers.filter(([k,u]) => u.zone);

  // Statystyki
  const totalLogged = loggedUsers.length;
  const totalAssigned = assigned.length;
  const totalUnassigned = unassigned.length;
  statsDiv.innerHTML = `
    <p>Łącznie zalogowanych: ${totalLogged}</p>
    <p>Przypisanych do stref: ${totalAssigned}</p>
    <p>Nieprzypisanych: ${totalUnassigned}</p>
    ${Object.entries(zonesData).map(([key,z])=>{
      const count = loggedUsers.filter(([k,u])=> u.zone === key).length;
      return `<p>Strefa "${z.name}": ${count}</p>`;
    }).join("")}
  `;

  // Budowanie tabeli
  loggedUsersTable.innerHTML = "";

  // najpierw nieprzypisani
  unassigned.concat(assigned).forEach(([key,u])=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${u.name}</td>
      <td class="border p-2">${u.zone ?? "-"}</td>
      <td class="border p-2">
        <select class="zoneSelect" data-user="${key}">
          <option value="">---</option>
          ${Object.entries(zonesData).map(([zKey,z])=>
            `<option value="${zKey}" ${u.zone===zKey?'selected':''} style="background:${z.color}">${z.name}</option>`
          ).join("")}
        </select>
      </td>
    `;
    loggedUsersTable.appendChild(tr);
  });

  // obsługa zmiany strefy
  const selects = document.querySelectorAll(".zoneSelect");
  selects.forEach(sel => {
    sel.onchange = async (e) => {
      const userKey = e.target.dataset.user;
      const zoneKey = e.target.value || null;
      await update(ref(db, `users/${userKey}`), { zone: zoneKey });
      // onValue automatycznie odświeża statystyki i tabelę
    }
  });
}
