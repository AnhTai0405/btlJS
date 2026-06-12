import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

document.getElementById('login-form').addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (email === "" || password === "") {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(function() {
            window.location.href = "index.html";
        })
        .catch(function(error) {
            console.error(error);
            if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
                alert("Sai tài khoản hoặc mật khẩu!");
            } else {
                alert("Đăng nhập không thành công!");
            }
        });
});