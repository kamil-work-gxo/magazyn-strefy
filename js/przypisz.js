import { db, ref, update, onValue } from "../firebase-config.js";

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

  // Filtrujemy zalogowanych użytkowników
  const loggedUsers = Object.entries(usersData).filter(([k, u]) => u.online);

  // Podział na nieprzypisanych i przypisanych
  const unassigned = loggedUsers.filter(([k, u]) => !u.zone);
  const assigned = loggedUsers.filter(([k, u]) => u.zone);

  // Statystyki
  const totalLogged = loggedUsers.length;
  const totalAssigned = assigned.length;
  const totalUnassigned = unassigned.length;

  statsDiv.innerHTML = `
    <p>Łącznie zalogowanych: ${totalLogged}</p>
    <p>Przypisanych do stref: ${totalAssigned}</p>
    <p>Nieprzypisanych: ${totalUnassigned}</p>
    ${Object.entries(zonesData).map(([key, z]) => {
      const count = loggedUsers.filter(([k, u]) => u.zone === key).length;
      return `<p>Strefa "${z.name}": ${count}</p>`;
    }).join("")}
  `;

  // Budowanie tabeli: najpierw nieprzypisani, potem przypisani
  loggedUsersTable.innerHTML = "";
  unassigned.concat(assigned).forEach(([key, u]) => {
    const zoneName = u.zone ? (zonesData[u.zone]?.name ?? u.zone) : "-";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${u.name}</td>
      <td class="border p-2">${zoneName}</td>
      <td class="border p-2">
        <select class="zoneSelect" data-user="${key}">
          <option value="">---</option>
          ${Object.entries(zonesData).map(([zKey, z]) => {
            const color = z?.color ?? "#eee";
            const name = z?.name ?? zKey;
            const selected = u.zone === zKey ? "selected" : "";
            return `<option value="${zKey}" ${selected} style="background:${color}">${name}</option>`;
          }).join("")}
        </select>
      </td>
    `;
    loggedUsersTable.appendChild(tr);
  });

  // Obsługa zmiany strefy
  const selects = document.querySelectorAll(".zoneSelect");
  selects.forEach(sel => {
    sel.onchange = async (e) => {
      const userKey = e.target.dataset.user;
      const zoneKey = e.target.value || null;
      await update(ref(db, `users/${userKey}`), { zone: zoneKey });
      // onValue automatycznie odświeża statystyki i tabelę
    };
  });
}
