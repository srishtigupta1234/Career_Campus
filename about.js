import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  query,
  collection,
  where,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyADmbTqSn5hWRFG2__MS2EdcLanzuzT0Iw",
  authDomain: "career-guidence-app-47f66.firebaseapp.com",
  projectId: "career-guidence-app-47f66",
  messagingSenderId: "568982405359",
  appId: "1:568982405359:web:00ca06577a4ea78bfadb1a",
  measurementId: "G-K1PM6DHE9R",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  const aptitud = document.getElementById("aptitudee");
  const appn = document.getElementById("appn");
  const profile = document.getElementById("profile");

  if (!user) {
    window.location.href = "login.html"; // Redirect unauthenticated users
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};

  if (userData.role === "user") {
    aptitud.style.display = "block";
    appn.style.display = "none";
  } else {
    aptitud.style.display = "none";
    appn.style.display = "block";
  }
});



document.getElementById("logoutBtn").addEventListener("click", () => {
  auth
    .signOut()
    .then(() => {
      window.location.href = "login.html";
      alert("You have been logged out successfully.");
    })
    .catch((error) => {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out.");
    });
});
