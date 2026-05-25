import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "AIzaSyDj5RyLOA2KA7JPDP8A3ghQXXQkQNFJuQ",

    authDomain: "btl-js.firebaseapp.com",

    projectId: "btl-js",

    storageBucket: "btl-js.firebasestorage.app",

    messagingSenderId: "1012222740",

    appId: "1:1012222740:web:f1a91794b367c869cc5001",

    measurementId: "G-WV5MVLYEZ6"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

let subjects = [];

let subjectForm = document.getElementById("subjectForm");

let subjectList = document.getElementById("subjectList");

let searchInput = document.getElementById("searchInput");

let filterDifficulty = document.getElementById("filterDifficulty");

let difficulty = document.getElementById("difficulty");

let difficultyValue = document.getElementById("difficultyValue");

let error = document.getElementById("error");

let darkModeBtn = document.getElementById("darkModeBtn");

difficulty.addEventListener("input", function () {

    difficultyValue.innerHTML = difficulty.value;
});

subjectForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    let subjectName =
        document.getElementById("subjectName").value;

    let department =
        document.getElementById("department").value;

    let assignments =
        document.getElementById("assignments").value;

    let passLevel =
        document.getElementById("passLevel").value;

    let prerequisite =
        document.getElementById("prerequisite").value;

    let review =
        document.getElementById("review").value;

    if (
        subjectName == "" ||
        department == "" ||
        review == ""
    ) {

        error.innerHTML =
            "Vui lòng nhập đầy đủ thông tin!";

        return;
    }

    error.innerHTML = "";

    let subject = {

        subjectName,

        department,

        difficulty: Number(difficulty.value),

        assignments,

        passLevel,

        prerequisite,

        review
    };

    await addDoc(
        collection(db, "subjects"),
        subject
    );

    loadSubjects();

    subjectForm.reset();

    difficultyValue.innerHTML = 5;
});

function renderSubjects(data) {

    subjectList.innerHTML = "";

    data.forEach(function (subject) {

        let level = "";

        if (subject.difficulty <= 4) {

            level = "easy";
        }

        else if (subject.difficulty <= 7) {

            level = "medium";
        }

        else {

            level = "hard";
        }

        subjectList.innerHTML += `
        
        <div class="card ${level}">
        
            <h3>${subject.subjectName}</h3>

            <p>
                <b>Khoa:</b>
                ${subject.department}
            </p>

            <p>
                <b>Độ khó:</b>
                ${subject.difficulty}/10
            </p>

            <p>
                <b>Bài tập:</b>
                ${subject.assignments}
            </p>

            <p>
                <b>Qua môn:</b>
                ${subject.passLevel}
            </p>

            <p>
                <b>Môn cần học trước:</b>
                ${subject.prerequisite}
            </p>

            <p>
                <b>Review:</b>
                ${subject.review}
            </p>

            <button
                class="deleteBtn"
                onclick="deleteSubject('${subject.firebaseId}')"
            >
                Xóa
            </button>

        </div>
        `;
    });
}

window.deleteSubject = async function(id) {

    await deleteDoc(
        doc(db, "subjects", id)
    );

    loadSubjects();
}

searchInput.addEventListener("input", function () {

    let keyword =
        searchInput.value.toLowerCase();

    let filtered = subjects.filter(function (subject) {

        return subject.subjectName
            .toLowerCase()
            .includes(keyword);
    });

    renderSubjects(filtered);
});

filterDifficulty.addEventListener("change", function () {

    let value = filterDifficulty.value;

    let filtered = subjects;

    if (value == "easy") {

        filtered = subjects.filter(function (subject) {

            return subject.difficulty <= 4;
        });
    }

    else if (value == "medium") {

        filtered = subjects.filter(function (subject) {

            return subject.difficulty >= 5 &&
                   subject.difficulty <= 7;
        });
    }

    else if (value == "hard") {

        filtered = subjects.filter(function (subject) {

            return subject.difficulty >= 8;
        });
    }

    renderSubjects(filtered);
});

function renderTopSubjects() {

    let topSubjects =
        document.getElementById("topSubjects");

    topSubjects.innerHTML = "";

    let sorted = [...subjects].sort(function (a, b) {

        return b.difficulty - a.difficulty;
    });

    let top3 = sorted.slice(0, 3);

    top3.forEach(function (subject, index) {

        topSubjects.innerHTML += `
        
        <div class="top-card">
        
            <h3>
                #${index + 1}
                ${subject.subjectName}
            </h3>

            <p>
                Độ khó:
                ${subject.difficulty}/10
            </p>

        </div>
        `;
    });
}

darkModeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );
});

function loadDarkMode() {

    let darkMode =
        localStorage.getItem("darkMode");

    if (darkMode == "true") {

        document.body.classList.add("dark");
    }
}

async function loadSubjects() {

    const querySnapshot =
        await getDocs(collection(db, "subjects"));

    subjects = [];

    querySnapshot.forEach(function(docItem) {

        subjects.push({

            firebaseId: docItem.id,

            ...docItem.data()
        });

    });

    renderSubjects(subjects);

    renderTopSubjects();
}

loadSubjects();

loadDarkMode();