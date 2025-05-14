
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
  import { getFirestore, doc, setDoc, serverTimestamp, getDoc, getDocs, query, collection, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
    let profile = document.getElementById("profile");
    let login = document.getElementById("login");
    let register = document.getElementById("register");
    let logout = document.getElementById("logoutBtn");
    let greetingMsg = document.getElementById("greet");
    let appn = document.getElementById("appn");
    let aptitud = document.getElementById("aptitude");
   
    if (user) {
      profile.style.display = "block";
      logout.style.display = "block";
      login.style.display = "none";
      register.style.display = "none";
      appn.style.display = "block";


    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const collegeDoc = await getDoc(doc(db, "colleges", user.uid));
    const collegeData = collegeDoc.exists() ? collegeDoc.data() : {};

    const name = userData.fullName || "User";
    const role = userData.role || collegeData.role;
    const greet = new Date().getHours() < 12 ? "Good Morning" : "Good Evening";

    if (role === "college") {
      greetingMsg.style.display="block";
      greetingMsg.innerHTML = `<h2>👩‍💼 ${greet}, ${collegeData.name}!</h2><p>You can now review student applications and manage your college profile.</p>`;
      aptitud.style.display = "none";
      register.style.display = "block";
    } else {
      greetingMsg.style.display="block";
      greetingMsg.innerHTML = `<h2>🎓 ${greet}, ${name}!</h2><p>Explore top colleges, apply to your dream course, and track your progress!</p>`;
    }

      const appQuery = query(collection(db, "applications"), where("userId", "==", user.uid));
      const appSnap = await getDocs(appQuery);
      const appList = document.getElementById("applicationList");
      appList.innerHTML = "";

      if (appSnap.empty) {
        appList.innerHTML = "<p>No applications found.</p>";
        return;
      }

      for (const docSnap of appSnap.docs) {
        const data = docSnap.data();
        const collegeRef = doc(db, "colleges", data.collegeId);
        const collegeDoc = await getDoc(collegeRef);

        const collegeName = collegeDoc.exists() ? collegeDoc.data().name : "Unknown College";
        const status = data.status || "Pending";
        const score = data.aptitudeTestScore !== undefined ? data.aptitudeTestScore : "Not attempted";
        const appliedDate = data.submittedAt?.toDate().toLocaleDateString() || "N/A";
        const documents = Array.isArray(data.documents) ? data.documents.join(", ") : "Not Provided";
        const eligibility = data.eligibility ? "Yes" : "No";

        const card = document.createElement("div");
        card.className = "app-card";
        card.innerHTML = `
          <h3>${collegeName}</h3>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Score:</strong> ${score}</p>
          <button class="toggle-details">View More</button>
          <div class="app-details" style="display: none;">
            <p><strong>Applied On:</strong> ${appliedDate}</p>
            <p><strong>Eligibility Met:</strong> ${eligibility}</p>
            <p><strong>Documents:</strong> ${documents}</p>
          </div>
        `;

        card.querySelector(".toggle-details").addEventListener("click", function () {
          const details = card.querySelector(".app-details");
          if (details.style.display === "none") {
            details.style.display = "block";
            this.textContent = "View Less";
          } else {
            details.style.display = "none";
            this.textContent = "View More";
          }
        });

        appList.appendChild(card);
      }
    } else {
      profile.style.display = "none";
      logout.style.display = "none";
      login.style.display = "block";
      register.style.display = "block";
      appn.style.display = "none";
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

  document.getElementById("three").addEventListener("click",()=>{
    window.location.href="aptitude.html";
  })

  document.getElementById("two").addEventListener("click",()=>{
    window.location.href = "finder.html";
  })

  document.getElementById("one").addEventListener("click",()=>{
    window.location.href="dashboard.html";
  })

  document.getElementById("tat").addEventListener("click",()=>{
    window.location.href="aptitude.html";
  })
  document.getElementById("ec").addEventListener("click",()=>{
    window.location.href = "finder.html"
  })