import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Thay thế đoạn này vào TRONG CẢ 2 FILE login.js và register.js
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
const auth = getAuth(app);

document.getElementById('btn-register').addEventListener("click", function (event) {
    event.preventDefault();
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    if (!email || !password) {
        alert("Vui lòng điền đầy đủ thông tin đăng ký!");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Đăng ký tài khoản thành công!");
            window.location.href = "login.html"; // Đăng ký xong quay lại giao diện đăng nhập
        })
        .catch((error) => {
            alert("Lỗi đăng ký: " + error.message);
        });
});