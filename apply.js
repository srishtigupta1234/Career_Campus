import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyADmbTqSn5hWRFG2__MS2EdcLanzuzT0Iw",
  authDomain: "career-guidence-app-47f66.firebaseapp.com",
  projectId: "career-guidence-app-47f66",
  messagingSenderId: "568982405359",
  appId: "1:568982405359:web:00ca06577a4ea78bfadb1a",
  measurementId: "G-K1PM6DHE9R",
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🌐 Get selected college name from URL
const urlParams = new URLSearchParams(window.location.search);

const collegeId = urlParams.get("id");  // Get collegeId from URL
const collegeName = urlParams.get("college");  // Get collegeName from URL
  
document.getElementById("selectedCollege").textContent = collegeName;
document.getElementById("collegeIdInput").value= collegeId
document.getElementById("collegeNameInput").value = collegeName; // hidden input or visible input

// 👤 Track auth and prefill user data
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const prefill = (id, value) => {
        const input = document.getElementById(id);
        if (input) input.value = value || "";
      };

      prefill("fullName", data.fullName);
      prefill("email", data.email);
      prefill("phone", data.phone);
      prefill("dob", data.dob);
      prefill("course", data.course);
      prefill("address", data.address);
      prefill("aptitudeTest", data.aptitudeTest);
      prefill("board", data.board);
      prefill("marks10", data.marks10);
      prefill("marks12", data.marks12);
      prefill("state", data.state);
      prefill("district", data.district);
      prefill("stream", data.stream);
      prefill("emergencyContactName", data.emergencyContactName);
      prefill("emergencyContactPhone", data.emergencyContactPhone);
      prefill("parentContact", data.parentContact);
      prefill("parentName", data.parentName);
      prefill("previousSchool", data.previousSchool);
      prefill("gender", data.gender);
    }
  } else {
    alert("You must be logged in to apply.");
    window.location.href = "login.html";
  }
});

// 📝 Submit application
document.getElementById("applicationForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("User not authenticated.");
    return;
  }

  // Collect all input values
  const getValue = (id) => document.getElementById(id)?.value || "";

  const applicationData = {
    userId: currentUser.uid,
    collegeName,
    collegeId,
    fullName: getValue("fullName"),
    email: getValue("email"),
    phone: getValue("phone"),
    dob: getValue("dob"),
    course: getValue("course"),
    address: getValue("address"),
    aptitudeTest: getValue("aptitudeTest"),
    board: getValue("board"),
    marks10: parseFloat(getValue("marks10")) || 0,
    marks12: parseFloat(getValue("marks12")) || 0,
    state: getValue("state"),
    district: getValue("district"),
    stream: getValue("stream"),
    emergencyContactName: getValue("emergencyContactName"),
    emergencyContactPhone: getValue("emergencyContactPhone"),
    parentContact: getValue("parentContact"),
    parentName: getValue("parentName"),
    previousSchool: getValue("previousSchool"),
    gender: getValue("gender"),
    submittedAt: serverTimestamp()
  };

  try {
    // Save application
    const docRef = await addDoc(collection(db, "applications"), applicationData);

    // Show popup and redirect
    const popup = document.getElementById('aptitudePopup');
    if (popup) popup.style.display = 'flex';

    document.getElementById('proceedTest').addEventListener('click', () => {
      window.location.href = `aptitude.html?appId=${docRef.id}`;
    });

    // Reset form
    document.getElementById("applicationForm").reset();
  } catch (error) {
    alert("Error submitting form: " + error.message);
    console.error("Application submission error:", error);
  }
});

const collegeDetailsContainer = document.getElementById("collegeDetails");

async function ensureCollegeName() {
    const urlParams = new URLSearchParams(window.location.search);
    const collegeId = urlParams.get("id");
    const collegeName = urlParams.get("college");
  
    if (!collegeId) {
      console.warn("No college ID found in URL.");
      return;
    }
  
    try {
      const collegeRef = doc(db, "colleges", collegeId);
      const snap = await getDoc(collegeRef);
      if (snap.exists()) {
        const data = snap.data();
        document.getElementById("selectedCollege").textContent = data.name;
        document.getElementById("collegeInput").value = data.name;
      } else {
        console.warn("College not found for given ID.");
      }
    } catch (err) {
      console.error("Error fetching college:", err);
    }
  }
  
//ensureCollegeName();
document.getElementById("logoutBtn").addEventListener("click", () => {
    auth.signOut()
      .then(() => {
        window.location.href = 'login.html';
        alert("You have been logged out successfully.");
      })
      .catch((error) => {
        console.error('Error during logout:', error);
        alert('An error occurred while logging out.');
      });
  });