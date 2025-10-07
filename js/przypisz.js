import { db, ref, get, update, onValue } from "../firebase-config.js";

const loggedUsersTable = document.getElementById("loggedUsersTable");
const statsDiv = document.getElementById("stats");

let zonesData = {};

onValue(ref(db, "zones"), (snap) => {
  zonesData = snap.val() || {};
  renderLoggedUsers();
});

onValue(ref(db, "users"), (snap) => {
  renderLoggedUsers();
});

function renderLoggedUsers() {
  get(ref(db, "users")).then(snap => {
    const users = snap.val() || {};
    const logged = Object.entries(users).filter(([key, u]) => u.online);

    // statystyki
    const totalLogged = logged.length;
    const assigned = logged.filter(([key,u])=> u.zone).length;
    const unassigned = totalLogged - assigned;
    statsDiv.innerHTML = `
      <p>Łącznie zalogowanych: ${totalLogged}</p>
      <p>Przypisanych do stref: ${assigned}</p>
      <p>Nieprzypisanych: ${unassigned}</p>
    `;

    // tabela zalogowanych
    loggedUsersTable.innerHTML = "";
    logged.forEach(([key, u]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${u.name}</td>
        <td class="border p-2">${u.zone ?? "-"}</td>
        <td class="border p-2">
          <select class="zoneSelect" data-user="${key}">
            <option value="">---</option>
            ${Object.entries(zonesData).map(([name,z])=>`<option value="${name}" style="background:${z.color}">${name}</option>`).join("")}
          </select>
        </td>
      `;
      loggedUsersTable.appendChild(tr);
    });

    // obsługa zmiany strefy
    const selects = document.querySelectorAll(".zoneSelect");
    selects.forEach(sel => {
      sel.addEventListener("change", async (e)=>{
        const userKey = e.target.dataset.user;
        const zone = e.target.value || null;
        await update(ref(db, "users/" + userKey), { zone });
      });
    });
  });
}
