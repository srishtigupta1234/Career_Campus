import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

const roleSelect = document.getElementById("roleSelect");
const collegeForm = document.getElementById("form");
const studentForm = document.getElementById("form2");

// To store aptitude test questions
let aptitudeQuestions = [];

// Initially hide both forms
collegeForm.style.display = "none";
studentForm.style.display = "none";

// Toggle forms on role change
 roleSelect.addEventListener("change", () => {
    if (roleSelect.value === "college") {
      form.style.display = "block";
      form2.style.display = "none";
    } else if (roleSelect.value === "user") {
      form.style.display = "none";
      form2.style.display = "block";
    } else {
      form.style.display = "none";
      form2.style.display = "none";
    }
  });
// College Registration
document.getElementById("collegeProfile").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Debug log to see if we have aptitude questions
  console.log("Aptitude questions before submission:", aptitudeQuestions);
  
  const email = document.getElementById("collegeEmail").value;
  const password = document.getElementById("collegePassword").value;
  const confirmPassword = document.getElementById("collegeConfirmPassword").value;

  if (password !== confirmPassword) return alert("Passwords do not match!");

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const facilities = Array.from(document.querySelectorAll('input[name="facilities"]:checked')).map(el => el.value);
    const otherFacility = document.getElementById("facilityOtherInput").value;
    const otherFacilityChecked = document.getElementById("facilityOtherCheckbox").checked;
    if (otherFacilityChecked && otherFacility.trim()) {
      facilities.push(otherFacility.trim());
    }

    // Get aptitude questions directly from the DOM if the array is empty
    if (aptitudeQuestions.length === 0) {
      console.log("Collecting aptitude questions from DOM");
      collectAptitudeQuestions();
    }

    // Make sure to include the aptitude questions in the college data
    const data = {
      name: document.getElementById("collegeName").value,
      code: document.getElementById("collegeCode").value,
      address: document.getElementById("collegeAddress").value,
      state: document.getElementById("state").value,
      district: document.getElementById("district").value,
      country: document.getElementById("country").value,
      email,
      phone: document.getElementById("collegePhone").value,
      website: document.getElementById("collegeWebsite").value,
      courses: document.getElementById("coursesOffered").value.split(",").map(course => course.trim()),
      seats: Number(document.getElementById("numSeats").value),
      eligibility: document.getElementById("eligibility").value,
      facilities,
      accreditation: document.getElementById("accreditation").value,
      aptitudeTest: aptitudeQuestions.length > 0 ? aptitudeQuestions : null,
      role: "college",
      createdAt: serverTimestamp()
    };

    console.log("College data to be saved:", data);
    await setDoc(doc(db, "colleges", uid), data);
    
    // If we have aptitude questions, save them separately (multiple approaches for reliability)
    if (aptitudeQuestions && aptitudeQuestions.length > 0) {
      // Approach 1: Use a subcollection - most reliable way
      try {
        console.log("Saving aptitude test to subcollection");
        await setDoc(doc(db, "colleges", uid, "aptitudeTests", "questions"), {
          questions: aptitudeQuestions,
          createdAt: serverTimestamp()
        });
        console.log("Subcollection saved successfully");
      } catch (subError) {
        console.error("Error saving to subcollection:", subError);
      }
      
      // Approach 2: Use addDoc instead of setDoc for more flexibility
      try {
        console.log("Saving aptitude test with addDoc");
        const aptitudeTestRef = collection(db, "colleges", uid, "tests");
        await addDoc(aptitudeTestRef, {
          questions: aptitudeQuestions,
          createdAt: serverTimestamp()
        });
        console.log("Added document successfully");
      } catch (addError) {
        console.error("Error using addDoc:", addError);
      }
    } else {
      console.warn("No aptitude questions to save");
    }
    
    alert("College registered successfully!");
  } catch (error) {
    alert("Error: " + error.message);
    console.error("College registration error:", error);
  }
});

// Function to collect aptitude questions directly from the DOM
function collectAptitudeQuestions() {
  aptitudeQuestions = []; // Reset the array
  
  // Try to find questions with different selectors for robustness
  const questionDivs = document.querySelectorAll(".aptitude-question");
  console.log("Found question divs:", questionDivs.length);
  
  if (questionDivs.length === 0) {
    console.warn("No .aptitude-question elements found");
    return;
  }
  
  questionDivs.forEach((div, index) => {
    // Try multiple selector approaches for robustness
    const questionId = div.dataset.questionId || (index + 1).toString();
    console.log("Processing question:", questionId);
    
    // Try multiple ways to find the question text
    let questionText;
    let questionInput = div.querySelector(`input[name="question${questionId}"]`);
    
    if (!questionInput) {
      questionInput = div.querySelector('input[name^="question"]');
    }
    
    if (!questionInput) {
      questionInput = div.querySelector('input[id^="aptitude"]');
    }
    
    if (questionInput) {
      questionText = questionInput.value.trim();
    } else {
      console.warn("Could not find question input for div", index);
      return; // Skip this question
    }
    
    // Similar approach for options
    const getOptionValue = (prefix) => {
      let input = div.querySelector(`input[name="${prefix}${questionId}"]`);
      if (!input) input = div.querySelector(`input[name^="${prefix}"]`);
      return input ? input.value.trim() : "";
    };
    
    const optionA = getOptionValue("optionA");
    const optionB = getOptionValue("optionB");
    const optionC = getOptionValue("optionC");
    const optionD = getOptionValue("optionD");
    
    // Get correct answer
    let correctKey;
    const correctSelect = div.querySelector(`select[name="correctAnswer${questionId}"]`) || 
                         div.querySelector('select[name^="correctAnswer"]');
    
    if (correctSelect) {
      correctKey = correctSelect.value;
    } else {
      console.warn("Could not find correct answer select for div", index);
      correctKey = "A"; // Default to A if not found
    }
    
    const optionsMap = { A: optionA, B: optionB, C: optionC, D: optionD };
    const correctAnswer = optionsMap[correctKey];
    
    // Check if we have all the required data
    if (questionText && optionA && optionB && optionC && optionD) {
      aptitudeQuestions.push({
        question: questionText,
        options: [optionA, optionB, optionC, optionD],
        correctAnswer: correctAnswer
      });
      console.log("Added question:", questionText);
    } else {
      console.warn("Skipping incomplete question", index);
    }
  });
  
  console.log("Collected aptitude questions:", aptitudeQuestions.length);
}

// Student Registration
document.getElementById("studentRegister").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) return alert("Passwords do not match!");

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    let selectedCourse = document.getElementById("courseInterest").value;
    if (selectedCourse === "Other") {
      const otherCourse = document.getElementById("courseOtherInput").value.trim();
      if (otherCourse) {
        selectedCourse = otherCourse;
      }
    }

    const aptitudeTest = document.getElementById("hasAT").checked
      ? {
          score: Number(document.getElementById("atScore").value),
          date: document.getElementById("atDate").value
        }
      : null;

    const data = {
      fullName: document.getElementById("fullName").value,
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      email,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
      state: document.getElementById("state").value,
      district: document.getElementById("district").value,
      parentName: document.getElementById("parentName").value,
      parentContact: document.getElementById("parentContact").value,
      emergencyName: document.getElementById("emergencyName").value,
      emergencyPhone: document.getElementById("emergencyPhone").value,
      previousSchool: document.getElementById("previousSchool").value,
      board: document.getElementById("board").value,
      marks10: Number(document.getElementById("marks10").value),
      marks12: Number(document.getElementById("marks12").value),
      stream: document.getElementById("stream").value,
      course : selectedCourse,
      aptitudeTest,
      username: document.getElementById("username").value,
      role: "student",
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", uid), data);
    alert("Student registered successfully!");
  } catch (error) {
    alert("Error: " + error.message);
    console.error(error);
  }
});

let questionCount = 1;

document.getElementById("addQuestionBtn").addEventListener("click", () => {
  questionCount++;

  const container = document.getElementById("aptitudeContainer");

  // Create a div to hold the question and its inputs
  const questionDiv = document.createElement("div");
  questionDiv.className = "aptitude-question";
  questionDiv.dataset.questionId = questionCount; // Add a data attribute for identification

  // Question label and input field
  const label = document.createElement("label");
  label.setAttribute("for", `aptitude${questionCount}`);
  label.textContent = `Question ${questionCount}`;

  const input = document.createElement("input");
  input.type = "text";
  input.name = `question${questionCount}`;  // Fixed: unique name with question number
  input.id = `aptitude${questionCount}`;
  input.placeholder = "Enter question";
  input.required = true;

  // Create options (A, B, C, D) inputs
  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  const optionALabel = document.createElement("label");
  optionALabel.textContent = "Option A";
  const optionAInput = document.createElement("input");
  optionAInput.type = "text";
  optionAInput.name = `optionA${questionCount}`;  // Fixed: unique name
  optionAInput.placeholder = "Enter option A";
  optionAInput.required = true;

  const optionBLabel = document.createElement("label");
  optionBLabel.textContent = "Option B";
  const optionBInput = document.createElement("input");
  optionBInput.type = "text";
  optionBInput.name = `optionB${questionCount}`;  // Fixed: unique name
  optionBInput.placeholder = "Enter option B";
  optionBInput.required = true;

  const optionCLabel = document.createElement("label");
  optionCLabel.textContent = "Option C";
  const optionCInput = document.createElement("input");
  optionCInput.type = "text";
  optionCInput.name = `optionC${questionCount}`;  // Fixed: unique name
  optionCInput.placeholder = "Enter option C";
  optionCInput.required = true;

  const optionDLabel = document.createElement("label");
  optionDLabel.textContent = "Option D";
  const optionDInput = document.createElement("input");
  optionDInput.type = "text";
  optionDInput.name = `optionD${questionCount}`;  // Fixed: unique name
  optionDInput.placeholder = "Enter option D";
  optionDInput.required = true;

  optionsDiv.appendChild(optionALabel);
  optionsDiv.appendChild(optionAInput);
  optionsDiv.appendChild(optionBLabel);
  optionsDiv.appendChild(optionBInput);
  optionsDiv.appendChild(optionCLabel);
  optionsDiv.appendChild(optionCInput);
  optionsDiv.appendChild(optionDLabel);
  optionsDiv.appendChild(optionDInput);

  // Create the correct answer dropdown
  const correctAnswerLabel = document.createElement("label");
  correctAnswerLabel.textContent = "Correct Answer";
  const correctAnswerSelect = document.createElement("select");
  correctAnswerSelect.name = `correctAnswer${questionCount}`;  // Fixed: unique name
  const option1 = document.createElement("option");
  option1.value = "A";
  option1.textContent = "Option A";
  const option2 = document.createElement("option");
  option2.value = "B";
  option2.textContent = "Option B";
  const option3 = document.createElement("option");
  option3.value = "C";
  option3.textContent = "Option C";
  const option4 = document.createElement("option");
  option4.value = "D";
  option4.textContent = "Option D";
  
  correctAnswerSelect.appendChild(option1);
  correctAnswerSelect.appendChild(option2);
  correctAnswerSelect.appendChild(option3);
  correctAnswerSelect.appendChild(option4);

  // Append everything to the question div
  questionDiv.appendChild(label);
  questionDiv.appendChild(input);
  questionDiv.appendChild(optionsDiv);
  questionDiv.appendChild(correctAnswerLabel);
  questionDiv.appendChild(correctAnswerSelect);

  // Add a remove button for this question
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove Question";
  removeBtn.type = "button";
  removeBtn.className = "remove-question-btn";
  removeBtn.addEventListener("click", () => {
    container.removeChild(questionDiv);
  });
  questionDiv.appendChild(removeBtn);

  // Append the new question div to the container
  container.appendChild(questionDiv);
  
  console.log(`Added question ${questionCount} to the DOM`);
});

document.getElementById("courseInterest").addEventListener("change", function () {
  const courseOtherLabel = document.getElementById("courseOtherLabel");
  if (this.value === "Other") {
    courseOtherLabel.style.display = "block";
  } else {
    courseOtherLabel.style.display = "none";
  }
});

// Aptitude test conditional fields (show/hide)
document.getElementById("hasAT").addEventListener("change", () => {
  const checked = document.getElementById("hasAT").checked;
  document.getElementById("atScore").style.display = checked ? "block" : "none";
  document.getElementById("atDate").style.display = checked ? "block" : "none";
  document.getElementById("labelAtScore").style.display = checked ? "block" : "none";
  document.getElementById("labelAtDate").style.display = checked ? "block" : "none";
});

// Fixed submitQuestionsBtn event handler
document.getElementById("submitQuestionsBtn").addEventListener("click", () => {
  collectAptitudeQuestions();
  
  // Show confirmation of questions stored
  if (aptitudeQuestions.length > 0) {
    alert(`${aptitudeQuestions.length} aptitude test questions have been added and will be saved when you submit the college registration.`);
  } else {
    alert("No questions were added. Please fill in all required fields.");
  }
});

// Make sure first question works with the same naming pattern
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - Initializing aptitude test");
  
  // Add data-question-id to the first question if it exists
  const firstQuestion = document.querySelector(".aptitude-question");
  if (firstQuestion) {
    console.log("Found first question element");
    firstQuestion.dataset.questionId = "1";
    
    // Update all input names to include the question number
    const questionInput = firstQuestion.querySelector('input[name="question"]');
    if (questionInput) {
      questionInput.name = "question1";
      console.log("Updated question input name");
    }
    
    const optionAInput = firstQuestion.querySelector('input[name="optionA"]');
    if (optionAInput) optionAInput.name = "optionA1";
    
    const optionBInput = firstQuestion.querySelector('input[name="optionB"]');
    if (optionBInput) optionBInput.name = "optionB1";
    
    const optionCInput = firstQuestion.querySelector('input[name="optionC"]');
    if (optionCInput) optionCInput.name = "optionC1";
    
    const optionDInput = firstQuestion.querySelector('input[name="optionD"]');
    if (optionDInput) optionDInput.name = "optionD1";
    
    const correctAnswerSelect = firstQuestion.querySelector('select[name="correctAnswer"]');
    if (correctAnswerSelect) correctAnswerSelect.name = "correctAnswer1";
  } else {
    console.warn("No aptitude question element found on page load");
  }
  
  // Ensure the global aptitudeQuestions array is initialized
  if (!aptitudeQuestions) {
    aptitudeQuestions = [];
    console.log("Initialized aptitudeQuestions array");
  }
});