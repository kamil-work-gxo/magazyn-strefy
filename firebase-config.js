// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "TWOJ_API_KEY",
  authDomain: "magazyn-strefy.firebaseapp.com",
  databaseURL: "https://magazyn-strefy-default-rtdb.firebaseio.com",
  projectId: "magazyn-strefy",
  storageBucket: "magazyn-strefy.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, get, onValue, update };
