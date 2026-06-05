import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Cấu hình Firebase chuẩn 100% (chữ q viết thường)
const firebaseConfig = {
    apiKey: "AIzaSyDj5RyLOA2KA7JPDP8A3ghqOXXQkQNFJuQ",
    authDomain: "btl-js.firebaseapp.com",
    databaseURL: "https://btl-js-default-rtdb.firebaseio.com",
    projectId: "btl-js",
    storageBucket: "btl-js.firebasestorage.app",
    messagingSenderId: "1012222740",
    appId: "1:1012222740:web:f1a91794b367c869cc5001",
    measurementId: "G-WV5MVLYEZ6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

// Đưa mảng subjects lên phạm vi window để đảm bảo an toàn tuyệt đối, tránh lỗi scope
window.subjects = [];

let subjectForm = document.getElementById("subjectForm");
let subjectList = document.getElementById("subjectList");
let searchInput = document.getElementById("searchInput");
let filterDifficulty = document.getElementById("filterDifficulty");
let difficulty = document.getElementById("difficulty");
let difficultyValue = document.getElementById("difficultyValue");
let error = document.getElementById("error");
let darkModeBtn = document.getElementById("darkModeBtn");

// 🚪 TÍNH NĂNG CANH CỬA KIỂM TRA ĐĂNG NHẬP
let isAuthChecked = false; 

onAuthStateChanged(auth, function(user) {
    if (!isAuthChecked) {
        isAuthChecked = true; 
    }

    if (!user) {
        console.log("Chưa đăng nhập, chuyển hướng về login...");
        window.location.href = "login.html";
    } else {
        console.log("Đã giữ chân thành công! Tài khoản:", user.email);
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.style.display = "block"; 
        }
        // Tải dữ liệu sau khi xác định được danh tính người dùng đăng nhập
        loadSubjects();
    }
});

// 🚪 XỬ LÝ SỰ KIỆN ĐĂNG XUẤT
document.getElementById("logoutBtn").addEventListener("click", function() {
    signOut(auth).then(function() {
        alert("Đã đăng xuất thành công!");
        window.location.href = "login.html";
    }).catch(function(error) {
        console.error("Lỗi đăng xuất:", error);
    });
});

// Thay đổi giá trị hiển thị độ khó khi kéo thanh range
difficulty.addEventListener("input", function () {
    difficultyValue.innerHTML = difficulty.value;
});

// THÊM ĐÁNH GIÁ MỚI VÀO FIRESTORE (ĐÃ THÊM USERID BẢO MẬT)
subjectForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    let subjectName = document.getElementById("subjectName").value;
    let department = document.getElementById("department").value;
    let assignments = document.getElementById("assignments").value;
    let passLevel = document.getElementById("passLevel").value;
    let prerequisite = document.getElementById("prerequisite").value;
    let review = document.getElementById("review").value;

    if (subjectName == "" || department == "" || review == "") {
        error.innerHTML = "Vui lòng nhập đầy đủ thông tin!";
        return;
    }

    error.innerHTML = "";

    // Lưu thông tin bài đánh giá kèm theo định danh tài khoản người viết
    let subject = {
        subjectName,
        department,
        difficulty: Number(difficulty.value),
        assignments,
        passLevel,
        prerequisite,
        review,
        userEmail: auth.currentUser ? auth.currentUser.email : "Ẩn danh",
        userId: auth.currentUser ? auth.currentUser.uid : ""
    };

    try {
        await addDoc(collection(db, "subjects"), subject);
        loadSubjects(); // Tải lại danh sách sau khi thêm thành công
        subjectForm.reset();
        difficultyValue.innerHTML = 5;
    } catch (err) {
        console.error("Lỗi khi thêm đánh giá:", err);
    }
});

// HIỂN THỊ DANH SÁCH ĐÁNH GIÁ (ĐÃ PHÂN QUYỀN NÚT XÓA CHÍNH CHỦ)
function renderSubjects(data) {
    subjectList.innerHTML = "";

    // Lấy ID người dùng đang đăng nhập hiện tại
    const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

    data.forEach(function (subject) {
        let level = "";
        if (subject.difficulty <= 4) {
            level = "easy";
        } else if (subject.difficulty <= 7) {
            level = "medium";
        } else {
            level = "hard";
        }

        // Kiểm tra: Nếu là chính chủ bài viết thì mới sinh code nút Xóa
        let deleteButtonHTML = "";
        if (currentUserId && subject.userId === currentUserId) {
            deleteButtonHTML = `<button class="deleteBtn" onclick="deleteSubject('${subject.firebaseId}')">Xóa</button>`;
        }

        subjectList.innerHTML += `
        <div class="card ${level}">
            <h3>${subject.subjectName}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">✍️ <b>Người đăng:</b> ${subject.userEmail || 'Ẩn danh'}</p>
            <p><b>Khoa:</b> ${subject.department}</p>
            <p><b>Độ khó:</b> ${subject.difficulty}/10</p>
            <p><b>Bài tập:</b> ${subject.assignments}</p>
            <p><b>Qua môn:</b> ${subject.passLevel}</p>
            <p><b>Môn cần học trước:</b> ${subject.prerequisite}</p>
            <p><b>Review:</b> ${subject.review}</p>
            ${deleteButtonHTML}
        </div>
        `;
    });
}

// XÓA ĐÁNH GIÁ THEO ID DỰ TRÊN FIREBASE
window.deleteSubject = async function(id) {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
        try {
            await deleteDoc(doc(db, "subjects", id));
            loadSubjects();
        } catch (err) {
            console.error("Lỗi khi xóa tài liệu:", err);
            alert("Bạn không có quyền xóa bài đánh giá này!");
        }
    }
}

// XỬ LÝ Ô TÌM KIẾM MÔN HỌC (ĐÃ ĐỒNG BỘ WINDOW.SUBJECTS)
searchInput.addEventListener("input", function () {
    let keyword = searchInput.value.toLowerCase();

    let filtered = (window.subjects || []).filter(function (subject) {
        return subject.subjectName.toLowerCase().includes(keyword);
    });

    renderSubjects(filtered);
});

// LỌC THEO ĐỘ KHÓ
filterDifficulty.addEventListener("change", function () {
    let value = filterDifficulty.value;
    let filtered = window.subjects;

    if (value == "easy") {
        filtered = window.subjects.filter(function (subject) {
            return subject.difficulty <= 4;
        });
    } else if (value == "medium") {
        filtered = window.subjects.filter(function (subject) {
            return subject.difficulty >= 5 && subject.difficulty <= 7;
        });
    } else if (value == "hard") {
        filtered = window.subjects.filter(function (subject) {
            return subject.difficulty >= 8;
        });
    }

    renderSubjects(filtered);
});

// HIỂN THỊ TOP 3 MÔN KHÓ NHẤT
function renderTopSubjects() {
    let topSubjects = document.getElementById("topSubjects");
    topSubjects.innerHTML = "";

    let sorted = [...window.subjects].sort(function (a, b) {
        return b.difficulty - a.difficulty;
    });

    let top3 = sorted.slice(0, 3);

    top3.forEach(function (subject, index) {
        topSubjects.innerHTML += `
        <div class="top-card">
            <h3>#${index + 1} ${subject.subjectName}</h3>
            <p>Độ khó: ${subject.difficulty}/10</p>
        </div>
        `;
    });
}

// XỬ LÝ DARK MODE
darkModeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

function loadDarkMode() {
    let darkMode = localStorage.getItem("darkMode");
    if (darkMode == "true") {
        document.body.classList.add("dark");
    }
}

// HÀM TẢI VÀ ĐỒNG BỘ DỮ LIỆU TỪ FIRESTORE
async function loadSubjects() {
    try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        window.subjects = [];

        querySnapshot.forEach(function(docItem) {
            window.subjects.push({
                firebaseId: docItem.id,
                ...docItem.data()
            });
        });

        renderSubjects(window.subjects);
        renderTopSubjects();
        
    } catch (err) {
        console.error("Lỗi khi tải dữ liệu từ Firestore:", err);
    }
}

// KÍCH HOẠT BAN ĐẦU
loadDarkMode();