import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

const listContainer = document.getElementById("collegeList");
const searchInput = document.getElementById("searchInput");


let allColleges = []; // Store all colleges to filter easily

 onAuthStateChanged(auth, async (user) => {
    let profile = document.getElementById("profile");
    let appn = document.getElementById("appn");
    let aptitud = document.getElementById("aptitudee");

  });

function renderCollege(data, collegeId) {
  const div = document.createElement("div");
  div.className = "college-card";
  div.innerHTML = `
    <h3>${data.name}</h3>
    <p><strong>Code:</strong> ${data.code}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Accreditation:</strong> ${data.accreditation}</p>
    <p><strong>Eligibility:</strong> ${data.eligibility}</p>
    <p><strong>Courses:</strong> ${data.courses}</p>
    <p><strong>Facilities:</strong> ${data.facilities}</p>
    <p><strong>Seats:</strong> ${data.seats}</p>
    <p><strong>Location:</strong> ${data.country}</p>
    <p><strong>Website:</strong> <a href="${data.website}" style="color:gold">${data.website}</a></p>
    <div id="bcontainer">
      <button class="apply-btn" data-id="${collegeId}" data-college="${data.name}">Apply Now</button>
    </div>
  `;
  listContainer.appendChild(div);
}

function displayColleges(filtered) {
  listContainer.innerHTML = "";
  if (filtered.length === 0) {
    listContainer.innerHTML = "<p style='text-align:center;'>No colleges found.</p>";
    return;
  }
  filtered.forEach(col => renderCollege(col.data, col.id));
}

function fetchColleges() {
  const collegesRef = collection(db, "colleges");
  getDocs(collegesRef).then(snapshot => {
    allColleges = [];
    snapshot.forEach(doc => {
      allColleges.push({ id: doc.id, data: doc.data() });
    });
    displayColleges(allColleges); // Default: show all
  }).catch(error => {
    console.error("Error fetching colleges: ", error);
  });
}

function filterColleges(country) {
  const filtered = allColleges.filter(col => (col.data.location || '').toLowerCase() === country.toLowerCase());
  displayColleges(filtered);
}

searchInput.addEventListener("input", () => {
  const queryText = searchInput.value.toLowerCase();
  const filtered = allColleges.filter(col => col.data.name.toLowerCase().includes(queryText));
  displayColleges(filtered);
});

fetchColleges();

document.getElementById("collegeList").addEventListener("click", function (e) {
  if (e.target.classList.contains("apply-btn")) {
    const collegeName = e.target.getAttribute("data-college");
    const collegeId = e.target.getAttribute("data-id");
    window.location.href = `apply.html?college=${encodeURIComponent(collegeName)}&id=${encodeURIComponent(collegeId)}`;
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


document.getElementById("in").addEventListener("click",()=>{
  filterColleges("India");
})
document.getElementById("ab").addEventListener("click",()=>{
  filterColleges("Abroad");
})