import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Same Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyADmbTqSn5hWRFG2__MS2EdcLanzuzT0Iw",
  authDomain: "career-guidence-app-47f66.firebaseapp.com",
  projectId: "career-guidence-app-47f66",
  messagingSenderId: "568982405359",
  appId: "1:568982405359:web:00ca06577a4ea78bfadb1a",
  measurementId: "G-K1PM6DHE9R",
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Facility Other toggle
document.getElementById("facilityOtherCheckbox").addEventListener("change", function() {
  const inp = document.getElementById("facilityOtherInput");
  inp.style.display = this.checked ? "block" : "none";
});

// Dynamic aptitude questions
let qCount = 1;
document.getElementById("addQuestionBtn").addEventListener("click", () => {
  qCount++;
  const container = document.getElementById("aptitudeContainer");
  const div = document.createElement("div");
  div.className = "aptitude-question";
  const label = document.createElement("label");
  label.textContent = `Question ${qCount}`;
  const input = document.createElement("input");
  input.type = "text";
  input.name = "aptitude[]";
  input.placeholder = "Enter question";
  input.required = true;
  div.append(label, input);
  container.appendChild(div);
});

// Form submission
document.getElementById("collegeRegister").addEventListener("submit", async e => {
  e.preventDefault();

  // Gather values
  const data = {
    collegeName: document.getElementById("collegeName").value,
    collegeCode: document.getElementById("collegeCode").value,
    collegeAddress: document.getElementById("collegeAddress").value,
    state: document.getElementById("state").value,
    district: document.getElementById("district").value,
    email: document.getElementById("collegeEmail").value,
    phone: document.getElementById("collegePhone").value,
    website: document.getElementById("collegeWebsite").value || null,
    coursesOffered: document.getElementById("coursesOffered").value
  .split(/\r?\n|,/)
  .map(s => s.trim())
  .filter(s => s),
    numSeats: Number(document.getElementById("numSeats").value),
    eligibility: document.getElementById("eligibility").value,
    facilities: Array.from(document.querySelectorAll("input[name='facilities']:checked")).map(f => f.value)
      .concat(document.getElementById("facilityOtherCheckbox").checked ? [document.getElementById("facilityOtherInput").value] : []),
    accreditation: document.getElementById("accreditation").value,
    aptitudeQuestions: Array.from(document.getElementsByName("aptitude[]")).map(i => i.value),
    password: document.getElementById("collegePassword").value,
    confirmPassword: document.getElementById("collegeConfirmPassword").value,
  };

  if (data.password !== data.confirmPassword) {
    return alert("Passwords do not match.");
  }

  try {
    // Auth
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    // Firestore
    await setDoc(doc(db, "colleges", cred.user.uid), {
      ...data,
      createdAt: serverTimestamp()
    });
    alert("College Registered!");
    window.location = "home.html";
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
});
