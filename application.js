import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyADmbTqSn5hWRFG2__MS2EdcLanzuzT0Iw",
  authDomain: "career-guidence-app-47f66.firebaseapp.com",
  projectId: "career-guidence-app-47f66",
  messagingSenderId: "568982405359",
  appId: "1:568982405359:web:00ca06577a4ea78bfadb1a",
  measurementId: "G-K1PM6DHE9R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const appContainer = document.getElementById("applications");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    appContainer.innerHTML = "<p>Please log in to view applications.</p>";
    return;
  }

  const uid = user.uid;

  // Check if the logged-in user is a college
  const collegeDoc = await getDoc(doc(db, "colleges", uid));
   const collegeData = collegeDoc.exists() ? collegeDoc.data() : {};

   const aptitud = document.getElementById("aptitudee");
   const appn = document.getElementById("appn");
  const profile = document.getElementById("profile");
  
    if (collegeData.role === "college") {
     
       aptitud.style.display = "none";
    } else {
      aptitud.style.display = "block";
    }


  if (collegeDoc.exists()) {
    // College View: Show applications where collegeId matches
    const q = query(collection(db, "applications"), where("collegeId", "==", uid));
    onSnapshot(q, (snapshot) => {
      appContainer.innerHTML = "";
      if (snapshot.empty) {
        appContainer.innerHTML = "<p>No applications found for this college.</p>";
        return;
      }

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const appDiv = document.createElement("div");
        appDiv.className = "application-card";

        appDiv.innerHTML = `
          <h3>${data.fullName}</h3>
          <p><strong>Course:</strong> ${data.course}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Aptitude Test Score:</strong> ${data.aptitudeTestScore}</p>
          <p><strong>Status:</strong> <span id="status-${docSnap.id}">${data.status}</span></p>
          <button onclick="updateStatus('${docSnap.id}', 'approved')">Approve</button>
          <button onclick="updateStatus('${docSnap.id}', 'rejected')">Reject</button>
        `;

        appContainer.appendChild(appDiv);
      });
    });

    window.updateStatus = async (appId, newStatus) => {
      try {
        await updateDoc(doc(db, "applications", appId), {
          status: newStatus
        });
        document.getElementById(`status-${appId}`).innerText = newStatus;
      } catch (error) {
        alert("Failed to update status: " + error.message);
      }
    };
  } else {
    // Student View: Show their own applications
    const q = query(collection(db, "applications"), where("userId", "==", uid));
    onSnapshot(q, (snapshot) => {
      appContainer.innerHTML = "";
      if (snapshot.empty) {
        appContainer.innerHTML = "<p>You have not applied to any college yet.</p>";
        return;
      }

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const appDiv = document.createElement("div");
        appDiv.className = "application-card";

        let statusSection = `<p><strong>Status:</strong> ${data.status}</p>`;
        if (data.status === "approved") {
          statusSection += `
            <div class="approved-msg">
              <h4>🎉 Congratulations!</h4>
              <p>Your application to <strong>${data.collegeName}</strong> has been approved.</p>
              <p>Please visit the college portal for the next steps in counseling and document verification.</p>
            </div>
          `;
          
        }else{
            statusSection+=`
               <div class="approved-msg">
  <h3">Application Status: <span style="color:#e74c3c;">Rejected</span></h3>
  <p>Thank you for your interest in applying to <strong>${data.collegeName}</strong>. After careful review of your application and eligibility criteria, we regret to inform you that your application has not been approved at this time.</p>
  <p>Please ensure your academic stream, subject choices, and documentation meet the required criteria before applying again. We encourage you to explore other available colleges and opportunities in the portal.</p>
  <p ">We wish you the best in your academic journey. For assistance, contact our support team.</p>
</div>`
        }

        appDiv.innerHTML = `
          <h3>${data.collegeName}</h3>
          <p><strong>Course:</strong> ${data.course}</p>
          <p><strong>Stream:</strong> ${data.stream}</p>
          ${statusSection}
        `;

        appContainer.appendChild(appDiv);
      });
    });
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