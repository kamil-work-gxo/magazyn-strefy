// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZzxQydgtPYdK7aVO9F7mei1I6e5f9Y7w",
  authDomain: "magazyn-strefy.firebaseapp.com",
  databaseURL: "https://magazyn-strefy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "magazyn-strefy",
  storageBucket: "magazyn-strefy.appspot.com",
  messagingSenderId: "588000222819",
  appId: "1:588000222819:web:9168e656dddb01c6fce256"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, get, onValue, update };
