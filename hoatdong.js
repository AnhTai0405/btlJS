import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";

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
const storage = getStorage(app);

window.subjects = [];

const subjectForm = document.getElementById("subjectForm");
const subjectList = document.getElementById("subjectList");
const searchInput = document.getElementById("searchInput");
const filterDifficulty = document.getElementById("filterDifficulty");
const difficulty = document.getElementById("difficulty");
const difficultyValue = document.getElementById("difficultyValue");
const error = document.getElementById("error");
const darkModeBtn = document.getElementById("darkModeBtn");
const logoutBtn = document.getElementById("logoutBtn");
const tabRating = document.getElementById("tab-rating");
const tabExchange = document.getElementById("tab-exchange");
const sectionRating = document.getElementById("section-rating");
const sectionExchange = document.getElementById("section-exchange");
const exchangeForm = document.getElementById("exchangeForm");
const exchangeList = document.getElementById("exchangeList");
const exchangeFile = document.getElementById("exchangeFile");
const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
const sidebar = document.querySelector(".sidebar");

let isAuthChecked = false;

onAuthStateChanged(auth, function(user) {
  if (!isAuthChecked) {
    isAuthChecked = true;
  }

  if (!user) {
    console.log("Chưa đăng nhập, chuyển hướng về login...");
    window.location.href = "login.html";
    return;
  }

  console.log("Đã giữ chân thành công! Tài khoản:", user.email);

  if (logoutBtn) {
    logoutBtn.style.display = "block";
  }

  loadSubjects();
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", function() {
    signOut(auth)
      .then(function() {
        alert("Đã đăng xuất thành công!");
        window.location.href = "login.html";
      })
      .catch(function(err) {
        console.error("Lỗi đăng xuất:", err);
      });
  });
}

difficulty.addEventListener("input", function() {
  difficultyValue.innerHTML = difficulty.value;
});

subjectForm.addEventListener("submit", async function(e) {
  e.preventDefault();

  const subjectName = document.getElementById("subjectName").value;
  const department = document.getElementById("department").value;
  const assignments = document.getElementById("assignments").value;
  const passLevel = document.getElementById("passLevel").value;
  const prerequisite = document.getElementById("prerequisite").value;
  const review = document.getElementById("review").value;

  if (subjectName === "" || department === "" || review === "") {
    error.innerHTML = "Vui lòng nhập đầy đủ thông tin!";
    return;
  }

  error.innerHTML = "";

  const subject = {
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
    loadSubjects();
    subjectForm.reset();
    difficultyValue.innerHTML = 5;
  } catch (err) {
    console.error("Lỗi khi thêm đánh giá:", err);
  }
});

function renderSubjects(data) {
  subjectList.innerHTML = "";
  const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

  data.forEach(function(subject) {
    let level = "";
    if (subject.difficulty <= 4) {
      level = "easy";
    } else if (subject.difficulty <= 7) {
      level = "medium";
    } else {
      level = "hard";
    }

    const deleteButtonHTML = currentUserId && subject.userId === currentUserId
      ? `<button class="deleteBtn" onclick="deleteSubject('${subject.firebaseId}')">Xóa</button>`
      : "";

    subjectList.innerHTML += `
      <div class="card ${level}">
        <h3>${subject.subjectName}</h3>
        <p style="font-size: 12px; color: #666; margin-bottom: 8px;">✍️ <b>Người đăng:</b> ${subject.userEmail || "Ẩn danh"}</p>
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

window.deleteSubject = async function(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
    return;
  }

  try {
    await deleteDoc(doc(db, "subjects", id));
    loadSubjects();
  } catch (err) {
    console.error("Lỗi khi xóa tài liệu:", err);
    alert("Bạn không có quyền xóa bài đánh giá này!");
  }
};

searchInput.addEventListener("input", function() {
  const keyword = searchInput.value.toLowerCase();
  const filtered = (window.subjects || []).filter(function(subject) {
    return subject.subjectName.toLowerCase().includes(keyword);
  });

  renderSubjects(filtered);
});

filterDifficulty.addEventListener("change", function() {
  const value = filterDifficulty.value;
  let filtered = window.subjects;

  if (value === "easy") {
    filtered = window.subjects.filter(function(subject) {
      return subject.difficulty <= 4;
    });
  } else if (value === "medium") {
    filtered = window.subjects.filter(function(subject) {
      return subject.difficulty >= 5 && subject.difficulty <= 7;
    });
  } else if (value === "hard") {
    filtered = window.subjects.filter(function(subject) {
      return subject.difficulty >= 8;
    });
  }

  renderSubjects(filtered);
});

function renderTopSubjects() {
  const topSubjects = document.getElementById("topSubjects");
  topSubjects.innerHTML = "";

  const sorted = [...window.subjects].sort(function(a, b) {
    return b.difficulty - a.difficulty;
  });

  const top3 = sorted.slice(0, 3);
  top3.forEach(function(subject, index) {
    topSubjects.innerHTML += `
      <div class="top-card">
        <h3>#${index + 1} ${subject.subjectName}</h3>
        <p>Độ khó: ${subject.difficulty}/10</p>
      </div>
    `;
  });
}

darkModeBtn.addEventListener("click", function() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

function loadDarkMode() {
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "true") {
    document.body.classList.add("dark");
  }
}

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

loadDarkMode();

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
  loadExchanges();
});

exchangeForm.addEventListener("submit", async function(e) {
  e.preventDefault();

  const content = document.getElementById("exchangeContent").value;
  const files = document.getElementById("exchangeFile").files;
  const submitBtn = document.getElementById("postExchangeBtn");

  if (content.trim() === "" && files.length === 0) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Đang tải lên...";

  try {
    let attachments = [];
    if (files.length > 0) {
      attachments = await uploadMultipleFiles(files);
    }

    const exchangePost = {
      content,
      userEmail: auth.currentUser ? auth.currentUser.email : "Ẩn danh",
      userId: auth.currentUser ? auth.currentUser.uid : "",
      timestamp: new Date().toISOString(),
      attachments
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

window.loadExchanges = async function() {
  try {
    const querySnapshot = await getDocs(collection(db, "exchanges"));
    exchangeList.innerHTML = "";
    const posts = [];

    querySnapshot.forEach(function(docItem) {
      posts.push({ firebaseId: docItem.id, ...docItem.data() });
    });

    posts.sort(function(a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

    posts.forEach(function(post) {
      const deleteBtnHTML = currentUserId && post.userId === currentUserId
        ? `<button class="deleteBtn" style="padding: 5px 10px; font-size: 12px; margin-top: 10px;" onclick="deleteExchange('${post.firebaseId}')">Xóa bài</button>`
        : "";

      const timeString = new Date(post.timestamp).toLocaleString("vi-VN");
      let mediaHTML = "";

      if (post.attachments && post.attachments.length > 0) {
        mediaHTML += `<div class="post-media">`;
        post.attachments.forEach(function(file) {
          if (file.type === "image") {
            mediaHTML += `<img src="${file.url}" alt="image" style="max-width: 100%; border-radius: 8px; margin-top: 10px;">`;
          } else {
            mediaHTML += `<a href="${file.url}" target="_blank" class="doc-link">📄 Tải xuống: ${file.name}</a>`;
          }
        });
        mediaHTML += `</div>`;
      }

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

      loadComments(post.firebaseId);
    });
  } catch (err) {
    console.error("Lỗi khi tải bài trao đổi:", err);
  }
};

window.loadComments = async function(postId) {
  try {
    const q = query(collection(db, "comments"), where("postId", "==", postId));
    const querySnapshot = await getDocs(q);
    const commentsList = document.getElementById(`comments-list-${postId}`);
    commentsList.innerHTML = "";

    const comments = [];
    querySnapshot.forEach(function(docItem) {
      comments.push({ id: docItem.id, ...docItem.data() });
    });

    comments.sort(function(a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    comments.forEach(function(c) {
      let fileHTML = "";

      if (c.attachment) {
        if (c.attachment.type === "image") {
          fileHTML = `<br><img src="${c.attachment.url}" style="max-width: 150px; border-radius: 8px; margin-top: 5px;">`;
        } else {
          fileHTML = `<br><a href="${c.attachment.url}" target="_blank" style="font-size: 12px; color: var(--primary-red);">📄 ${c.attachment.name}</a>`;
        }
      }

      commentsList.innerHTML += `
        <div style="background: var(--bg-white); padding: 8px 12px; border-radius: 15px; margin-bottom: 8px; font-size: 14px; display: inline-block; max-width: 100%;">
          <b>${c.userEmail.split("@")[0]}</b>: ${c.content}
          ${fileHTML}
        </div><br>
      `;
    });
  } catch (err) {
    console.error("Lỗi tải bình luận:", err);
  }
};

window.submitComment = async function(event, postId) {
  event.preventDefault();

  const textInput = document.getElementById(`comment-text-${postId}`);
  const fileInput = document.getElementById(`comment-file-${postId}`);
  const content = textInput.value;

  let attachment = null;
  if (fileInput.files.length > 0) {
    const files = await uploadMultipleFiles([fileInput.files[0]]);
    attachment = files[0];
  }

  const commentData = {
    postId,
    content,
    userEmail: auth.currentUser ? auth.currentUser.email : "Ẩn danh",
    timestamp: new Date().toISOString(),
    attachment
  };

  try {
    await addDoc(collection(db, "comments"), commentData);
    textInput.value = "";
    fileInput.value = "";
    loadComments(postId);
  } catch (err) {
    console.error("Lỗi đăng bình luận:", err);
  }
};

window.deleteExchange = async function(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
    return;
  }

  try {
    await deleteDoc(doc(db, "exchanges", id));
    loadExchanges();
  } catch (err) {
    console.error("Lỗi khi xóa bài trao đổi:", err);
    alert("Bạn không có quyền xóa bài viết này!");
  }
};

if (toggleSidebarBtn && sidebar) {
  toggleSidebarBtn.addEventListener("click", function() {
    sidebar.classList.toggle("collapsed");
  });
}

if (exchangeFile) {
  exchangeFile.addEventListener("change", function() {
    const fileText = document.getElementById("file-chosen-text");
    fileText.textContent = this.files.length > 0 ? `Đã chọn ${this.files.length} file` : "Chưa chọn file nào";
  });
}

async function uploadMultipleFiles(files) {
  const uploadedData = [];

  for (const file of files) {
    const storageRef = ref(storage, "exchanges/" + Date.now() + "_" + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const type = file.type.startsWith("image/") ? "image" : "document";

    uploadedData.push({ url, type, name: file.name });
  }

  return uploadedData;
}
