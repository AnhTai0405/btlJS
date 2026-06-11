import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
// Thêm thư viện Storage
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6Y4Ko6j3WXPMREiANgdqVuey7GljQ_qY",
  authDomain: "btljs-fbf67.firebaseapp.com",
  projectId: "btljs-fbf67",
  storageBucket: "btljs-fbf67.firebasestorage.app",
  messagingSenderId: "1099251923189",
  appId: "1:1099251923189:web:74f245398418757e642dbc",
  measurementId: "G-8QB0T4M16N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 
const storage = getStorage(app); // Khởi tạo Storage
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

// KIỂM TRA ĐĂNG NHẬP
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


// ==========================================
// TÍNH NĂNG CHUYỂN TAB (SIDEBAR)
// ==========================================
const tabRating = document.getElementById("tab-rating");
const tabExchange = document.getElementById("tab-exchange");
const sectionRating = document.getElementById("section-rating");
const sectionExchange = document.getElementById("section-exchange");

tabRating.addEventListener("click", function() {
    tabRating.classList.add("active");
    tabExchange.classList.remove("active");
    sectionRating.style.display = "block";
    sectionExchange.style.display = "none";
});

tabExchange.addEventListener("click", function() {
    tabExchange.classList.add("active");
    tabRating.classList.remove("active");
    sectionExchange.style.display = "block";
    sectionRating.style.display = "none";
    loadExchanges(); // Tải dữ liệu trao đổi khi mở tab
});

// ==========================================
// TÍNH NĂNG TRAO ĐỔI HỌC TẬP (FIRESTORE)
// ==========================================
const exchangeForm = document.getElementById("exchangeForm");
const exchangeList = document.getElementById("exchangeList");

// Gửi bài đăng trao đổi
exchangeForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    let content = document.getElementById("exchangeContent").value;
    let files = document.getElementById("exchangeFile").files;
    let submitBtn = document.getElementById("postExchangeBtn");

    if (content.trim() === "" && files.length === 0) return;

    submitBtn.disabled = true;
    submitBtn.innerText = "Đang tải lên..."; // Hiệu ứng chờ

    try {
        // 1. Upload file trước nếu có
        let attachments = [];
        if (files.length > 0) {
            attachments = await uploadMultipleFiles(files);
        }

        // 2. Lưu thông tin bài viết vào Firestore
        let exchangePost = {
            content: content,
            userEmail: auth.currentUser ? auth.currentUser.email : "Ẩn danh",
            userId: auth.currentUser ? auth.currentUser.uid : "",
            timestamp: new Date().toISOString(),
            attachments: attachments // Thêm mảng file vào database
        };

        await addDoc(collection(db, "exchanges"), exchangePost);
        exchangeForm.reset();
        document.getElementById("file-chosen-text").textContent = "Chưa chọn file nào";
        loadExchanges();
    } catch (err) {
        console.error("Lỗi khi đăng bài:", err);
        alert("Có lỗi xảy ra khi đăng bài!");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Đăng bài";
    }
});

// Tải và hiển thị bài đăng trao đổi
window.loadExchanges = async function() {
    try {
        const querySnapshot = await getDocs(collection(db, "exchanges"));
        exchangeList.innerHTML = "";
        let posts = [];

        querySnapshot.forEach(function(docItem) {
            posts.push({ firebaseId: docItem.id, ...docItem.data() });
        });

        posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

        posts.forEach(function(post) {
            let deleteBtnHTML = "";
            if (currentUserId && post.userId === currentUserId) {
                deleteBtnHTML = `<button class="deleteBtn" style="padding: 5px 10px; font-size: 12px; margin-top: 10px;" onclick="deleteExchange('${post.firebaseId}')">Xóa bài</button>`;
            }

            let timeString = new Date(post.timestamp).toLocaleString("vi-VN");

            // --- XỬ LÝ HIỂN THỊ FILE & ẢNH ĐÍNH KÈM ---
            let mediaHTML = "";
            if (post.attachments && post.attachments.length > 0) {
                mediaHTML += `<div class="post-media">`;
                post.attachments.forEach(file => {
                    if (file.type === "image") {
                        mediaHTML += `<img src="${file.url}" alt="image" style="max-width: 100%; border-radius: 8px; margin-top: 10px;">`;
                    } else {
                        mediaHTML += `<a href="${file.url}" target="_blank" class="doc-link">📄 Tải xuống: ${file.name}</a>`;
                    }
                });
                mediaHTML += `</div>`;
            }

            // --- XUẤT HTML BÀI VIẾT & KHUNG BÌNH LUẬN ---
            exchangeList.innerHTML += `
            <div class="exchange-card">
                <div style="font-size: 13px; color: #666; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
                    <b>👤 ${post.userEmail}</b> • ⏱️ ${timeString}
                </div>
                <p style="white-space: pre-wrap;">${post.content}</p>
                ${mediaHTML}
                ${deleteBtnHTML}
                
                <div class="comment-section" style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px;">
                    <div id="comments-list-${post.firebaseId}" class="comments-list"></div>
                    
                    <form onsubmit="submitComment(event, '${post.firebaseId}')" style="display: flex; gap: 10px; margin-top: 10px;">
                        <input type="text" id="comment-text-${post.firebaseId}" placeholder="Viết bình luận..." required style="flex: 1; padding: 8px; border-radius: 20px;">
                        <label style="cursor: pointer; padding: 8px; background: #e4e6eb; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                            📎
                            <input type="file" id="comment-file-${post.firebaseId}" accept="image/*, .pdf, .doc" style="display: none;">
                        </label>
                        <button type="submit" style="padding: 8px 15px; border-radius: 20px;">Gửi</button>
                    </form>
                </div>
            </div>
            `;

            // Kích hoạt load bình luận cho bài viết này
            loadComments(post.firebaseId);
        });
    } catch (err) {
        console.error("Lỗi khi tải bài trao đổi:", err);
    }
}

// Hàm Load Bình luận
window.loadComments = async function(postId) {
    try {
        const q = query(collection(db, "comments"), where("postId", "==", postId));
        const querySnapshot = await getDocs(q);
        let commentsList = document.getElementById(`comments-list-${postId}`);
        commentsList.innerHTML = "";
        
        // Chuyển sang mảng để sắp xếp theo thời gian cũ -> mới
        let comments = [];
        querySnapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
        comments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        comments.forEach(c => {
            let fileHTML = "";
            if(c.attachment) {
                if(c.attachment.type === 'image') {
                    fileHTML = `<br><img src="${c.attachment.url}" style="max-width: 150px; border-radius: 8px; margin-top: 5px;">`;
                } else {
                    fileHTML = `<br><a href="${c.attachment.url}" target="_blank" style="font-size: 12px; color: var(--primary-red);">📄 ${c.attachment.name}</a>`;
                }
            }

            commentsList.innerHTML += `
                <div style="background: var(--bg-white); padding: 8px 12px; border-radius: 15px; margin-bottom: 8px; font-size: 14px; display: inline-block; max-width: 100%;">
                    <b>${c.userEmail.split('@')[0]}</b>: ${c.content}
                    ${fileHTML}
                </div><br>
            `;
        });
    } catch (error) {
        console.error("Lỗi tải bình luận:", error);
    }
}

// Hàm Đăng Bình luận
window.submitComment = async function(event, postId) {
    event.preventDefault();
    let textInput = document.getElementById(`comment-text-${postId}`);
    let fileInput = document.getElementById(`comment-file-${postId}`);
    let content = textInput.value;

    let attachment = null;
    if (fileInput.files.length > 0) {
        let files = await uploadMultipleFiles([fileInput.files[0]]); // Load file đầu tiên
        attachment = files[0];
    }

    let commentData = {
        postId: postId,
        content: content,
        userEmail: auth.currentUser ? auth.currentUser.email : "Ẩn danh",
        timestamp: new Date().toISOString(),
        attachment: attachment
    };

    try {
        await addDoc(collection(db, "comments"), commentData);
        textInput.value = "";
        fileInput.value = "";
        loadComments(postId); // Load lại bình luận sau khi đăng
    } catch (error) {
        console.error("Lỗi đăng bình luận:", error);
    }
}

// Xóa bài trao đổi
window.deleteExchange = async function(id) {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
        try {
            await deleteDoc(doc(db, "exchanges", id));
            loadExchanges();
        } catch (err) {
            console.error("Lỗi khi xóa bài trao đổi:", err);
            alert("Bạn không có quyền xóa bài viết này!");
        }
    }
}

// TÍNH NĂNG ĐÓNG MỞ THANH BÊN (SIDEBAR TOGGLE)

const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
const sidebar = document.querySelector(".sidebar");

if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener("click", function() {
       
        sidebar.classList.toggle("collapsed");
    });
}

// TÍNH NĂNG HIỂN THỊ SỐ LƯỢNG FILE ĐÃ CHỌN TRONG BÀI TRAO ĐỔI
const exchangeFile = document.getElementById("exchangeFile");
if(exchangeFile) {
    exchangeFile.addEventListener("change", function() {
        const fileText = document.getElementById("file-chosen-text");
        if (this.files.length > 0) {
            fileText.textContent = `Đã chọn ${this.files.length} file`;
        } else {
            fileText.textContent = "Chưa chọn file nào";
        }
    });
}


// Hàm hỗ trợ upload mảng file lên Storage và trả về mảng URL
async function uploadMultipleFiles(files) {
    let uploadedData = [];
    for (let file of files) {
        const storageRef = ref(storage, 'exchanges/' + Date.now() + '_' + file.name);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        
        let type = file.type.startsWith('image/') ? 'image' : 'document';
        uploadedData.push({ url: url, type: type, name: file.name });
    }
    return uploadedData;
}