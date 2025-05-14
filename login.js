import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";


// Firebase config (same as before)
const firebaseConfig = {
  apiKey: "AIzaSyADmbTqSn5hWRFG2__MS2EdcLanzuzT0Iw",
  authDomain: "career-guidence-app-47f66.firebaseapp.com",
  projectId: "career-guidence-app-47f66",
  messagingSenderId: "568982405359",
  appId: "1:568982405359:web:00ca06577a4ea78bfadb1a",
  measurementId: "G-K1PM6DHE9R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.style.display = "none";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Simple client-side validation
  if (!email || !password) {
    errorMsg.textContent = "Please enter both email and password.";
    errorMsg.style.display = "block";
    return;
  }

  // Disable button and show loading text
  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error("Login error:", err);
    // Show user-friendly message
    switch (err.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        errorMsg.textContent = "Invalid email or password.";
        break;
      case "auth/invalid-email":
        errorMsg.textContent = "Please enter a valid email address.";
        break;
      case "auth/user-disabled":
        errorMsg.textContent = "This account has been disabled.";
        break;
      default:
        errorMsg.textContent = "Login failed. Please try again later.";
    }
    errorMsg.style.display = "block";
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
});

document.getElementById("forgotPassword").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = prompt("Please enter your registered email:");
  
  if (email) {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Reset error:", error.code, error.message);
      alert("Error: " + error.message);
    }
  }
});
