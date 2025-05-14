import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDoc,
  doc,
  query,
  where,
  getDocs,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyADmbTqSn5hWRFG2__MS2EdcLanzuzT0Iw",
  authDomain: "career-guidence-app-47f66.firebaseapp.com",
  projectId: "career-guidence-app-47f66",
  messagingSenderId: "568982405359",
  appId: "1:568982405359:web:00ca06577a4ea78bfadb1a",
  measurementId: "G-K1PM6DHE9R",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentQuiz = [];
let currentAppDocId = null;
let timer = 300; // 5 minutes in seconds
let timerInterval;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must be logged in to take the test.");
      window.location.href = "login.html";
      return;
    }
  
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.error("User data not found");
        return;
      }
  
      const appQuery = query(collection(db, "applications"), where("userId", "==", user.uid));
      const appSnap = await getDocs(appQuery);
  
      if (appSnap.empty) {
        console.error("No application found for user");
        return;
      }
  
      const appDoc = appSnap.docs[0];
      currentAppDocId = appDoc.id;
  
      const appData = appDoc.data();
      const collegeId = appData.collegeId;
  
      if (appData.aptitudeTestCompleted) {
        document.getElementById("startTestBtn").disabled = true;
        document.getElementById("startTestBtn").innerText = "Test Already Completed";
        document.getElementById("quiz-container").style.display = "none";
        document.getElementById("submitQuizBtn").style.display = "none";
        return;
      }
  
      const collegeRef = doc(db, "colleges", collegeId);
      const collegeDoc = await getDoc(collegeRef);
  
      if (!collegeDoc.exists()) {
        console.error("College not found");
        return;
      }
  
      const collegeData = collegeDoc.data();
      currentQuiz = collegeData.aptitudeTest || [];
  
      document.getElementById("college-name").innerText = `Quiz for: ${collegeData.name}`;
      renderQuiz(currentQuiz);
  
    } catch (error) {
      console.error("Error initializing quiz: ", error);
    }
  });
  
// Start the quiz when the "Start Test" button is clicked
document.getElementById("startTestBtn").addEventListener("click", () => {
  // Hide the Start Test button
  document.getElementById("startTestBtn").style.display = "none";
  
  // Render the quiz and start the timer
  renderQuiz(currentQuiz);
  startTimer();
  document.getElementById("submitQuizBtn").style.display = "block";
});

// Render the quiz questions dynamically
function renderQuiz(questions) {
  const quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = "";

  questions.forEach((q, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    questionDiv.innerHTML = `
      <h3>${q.question}</h3>
      <div class="options">
        ${q.options.map(option => `
          <label>
            <input type="radio" name="question${index}" value="${option}" />
            ${option}
          </label>
        `).join("")}
      </div>
    `;
    quizContainer.appendChild(questionDiv);
  });
}

// Get answers from the quiz form
function getQuizAnswers() {
  const answers = [];
  const questions = document.querySelectorAll(".question");

  questions.forEach((q, index) => {
    const selected = q.querySelector("input[type='radio']:checked");
    answers.push({
      question: currentQuiz[index].question,
      selectedAnswer: selected ? selected.value : null,
      correctAnswer: currentQuiz[index].correctAnswer
    });
  });

  return answers;
}

// Calculate score based on answers
function calculateScore(answers) {
  let score = 0;
  answers.forEach(ans => {
    if (ans.selectedAnswer && ans.selectedAnswer === ans.correctAnswer) {
      score += 1;
    }
  });
  return score;
}

// Timer functionality
function startTimer() {
  timerInterval = setInterval(function() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    
    document.getElementById("time-remaining").innerText = `${pad(minutes)}:${pad(seconds)}`;

    if (timer <= 0 || document.getElementById("submitQuizBtn").click()) {
      clearInterval(timerInterval);
      alert("Time's up!");
      
      // Automatically submit the quiz after time runs out
      document.getElementById("submitQuizBtn").click();
    }

    timer--;
  }, 1000);
}

function pad(num) {
  return num < 10 ? `0${num}` : num;
}

// Submit quiz and save results to Firestore
document.getElementById("submitQuizBtn").addEventListener("click", async () => {
  clearInterval(timerInterval);
  const answers = getQuizAnswers();
  const score = calculateScore(answers);

  if (!currentAppDocId) {
    alert("Application not found.");
    return;
  }

  try {
    const appRef = doc(db, "applications", currentAppDocId);
    await updateDoc(appRef, {
      aptitudeTestAnswers: answers,
      aptitudeTestScore: score,
      aptitudeTestCompleted: true
    });

    alert(`Your score is : ${score}`);
    window.location.href="home.html";

  } catch (error) {
    console.error("Error saving test results: ", error);
    alert("Failed to save your quiz. Please try again.");
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