import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyADmbTqSn5hWRFG2__MS2EdcLanzuzT0Iw",
  authDomain: "career-guidence-app-47f66.firebaseapp.com",
  projectId: "career-guidence-app-47f66",
  messagingSenderId: "568982405359",
  appId: "1:568982405359:web:00ca06577a4ea78bfadb1a",
  measurementId: "G-K1PM6DHE9R",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility: Create field element (text or input)
function createField(label, value, key, isEditing, dataObj) {
  const container = document.createElement("div");
  container.className = "field-block";

  const labelEl = document.createElement("label");
  labelEl.innerHTML = `<strong>${label}:</strong>`;
  container.appendChild(labelEl);

  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.disabled = !isEditing;
  input.dataset.key = key;
  input.className = "editable-input";

  container.appendChild(input);
  return container;
}

// Edit and Save Button
function createEditSaveButtons(container, docRef, dataObj) {
  const btnWrapper = document.createElement("div");
  btnWrapper.className = "button-wrapper";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className = "edit-btn";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.style.display = "none";
  saveBtn.className = "save-btn";

  btnWrapper.appendChild(editBtn);
  btnWrapper.appendChild(saveBtn);
  container.appendChild(btnWrapper);

  editBtn.onclick = () => {
    document.querySelectorAll(".editable-input").forEach((input) => {
      input.disabled = false;
    });
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
  };

  saveBtn.onclick = async () => {
    const updates = {};
    document.querySelectorAll(".editable-input").forEach((input) => {
      const key = input.dataset.key;
      updates[key] = input.value;
    });
    await updateDoc(docRef, updates);
    alert("Profile updated successfully!");
    location.reload(); // or re-fetch if you prefer not to reload
  };
}

function renderCollege(data, docRef) {
  const root = document.getElementById("profile-root");
  const container = document.createElement("div");
  container.className = "profile-container";

  const title = document.createElement("h2");
  title.textContent = "🏫 College Profile";
  container.appendChild(title);

  const card = document.createElement("div");
  card.className = "profile-card";

  const left = document.createElement("div");
  left.className = "profile-info";

  const right = document.createElement("div");
  right.className = "profile-info";

  // Editable fields
  const editableFields = {
    name: "College Name",
    code: "College Code",
    accreditation: "Accreditation",
    email: "Email",
    phone: "Phone",
    website: "Website",
    address: "Address",
    district: "District",
    state: "State",
    country :"country",
    eligibility: "Eligibility",
    seats: "Seats Available"
  };

  // Array fields (Courses and Facilities)
  const arrayFields = {
    courses: "Courses Offered",
    facilities: "Facilities"
  };

  // Loop through editable fields and append them to the left side
  for (let [key, label] of Object.entries(editableFields)) {
    left.appendChild(createField(label, data[key] || "", key, false, data));
  }

  // Loop through array fields and handle them accordingly
  for (let [key, label] of Object.entries(arrayFields)) {
    const value = data[key] && Array.isArray(data[key]) ? data[key].join(", ") : "N/A";
    right.appendChild(createField(label, value, key, false, data));
  }
  
  card.appendChild(left);
  card.appendChild(right);
  container.appendChild(card);
  createEditSaveButtons(container, docRef, data);
  root.appendChild(container);
}

// Render User Profile
function renderUser(data, docRef) {
  const root = document.getElementById("profile-root");
  const container = document.createElement("div");
  container.className = "profile-container";

  const title = document.createElement("h2");
  title.textContent = "👩 Student Profile";
  container.appendChild(title);

  const card = document.createElement("div");
  card.className = "profile-card";

  const profileInfo = document.createElement("div");
  profileInfo.className = "profile-info";

  const emergencyInfo = document.createElement("div");
  emergencyInfo.className = "emergency-info";

  const schoolInfo = document.createElement("div");
  schoolInfo.className = "school-info";

  const profiletitle = document.createElement("h3");
  profiletitle.textContent = "🎓 Personal Information "
  profileInfo.appendChild(profiletitle);


  const profileFields = {
    fullName: "Full Name",
    username: "Username",
    dob: "Date of Birth",
    gender: "Gender",
    phone: "Phone",
    email: "Email",
    address: "Address",
  };

  const emergencyFields = {
    parentName: "Parent Name",
    parentContact: "Parent Contact",
    emergencyContactName: "Emergency Contact Name",
    emergencyContactPhone: "Emergency Phone"
  };


  for (let [key, label] of Object.entries(profileFields)) {
    profileInfo.appendChild(createField(label, data[key] || "", key, false, data));
  }

  const emergencyTitle = document.createElement("h3");
  emergencyTitle.textContent = "🧑‍🤝‍🧑 Emergency Contact";
  emergencyInfo.appendChild(emergencyTitle);

  for (let [key, label] of Object.entries(emergencyFields)) {
    emergencyInfo.appendChild(createField(label, data[key] || "", key, false, data));
  }

  const schooltitle = document.createElement("h3");
  schooltitle.textContent = "🎓 Previous Education Information "
  schoolInfo.appendChild(schooltitle);

  const schoolFields={
    marks10: "Marks 10th",
    marks12 : "Marks 12th",
    stream: "Stream",
    previousSchool: "Previous School"

  }

  for(let[key,label] of Object.entries(schoolFields)){
    schoolInfo.appendChild(createField(label,data[key] || "", key, false, data));
  }

  card.appendChild(profileInfo);
  card.appendChild(schoolInfo);
  card.appendChild(emergencyInfo)
  container.appendChild(card);
  createEditSaveButtons(container, docRef, data);
  root.appendChild(container);
}

onAuthStateChanged(auth, async (user) => {
  const root = document.getElementById("profile-root");

  if (!user) {
    root.innerText = "Not Logged In.";
    return;
  }

  const uid = user.uid;

  try {
    // Try fetching from 'users' collection (students)
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      renderUser(data, userRef);
      return;
    }

    // If not found in 'users', try 'colleges' collection
    const collegeRef =  doc(db, "colleges", uid);
    const collegeSnap = await getDoc(collegeRef);
     const aptitud = document.getElementById("aptitudee");
  
  

    if (collegeSnap.exists()) {
      const data = collegeSnap.data();
        if (data.role === "college") {
     
       aptitud.style.display = "none";
    } else {
      aptitud.style.display = "block";
    }
      renderCollege(data, collegeRef);
      return;
    }

    // If not found in either collection
    root.innerText = "No user data found in either 'users' or 'colleges'.";
  } catch (error) {
    console.error("Error fetching user data:", error);
    root.innerText = "An error occurred while loading the profile.";
  }
});
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