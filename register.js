import { auth } from "./firebase-init.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

document.getElementById('register-form').addEventListener("submit", function (event) {
    event.preventDefault();
    
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    if (!email || !password) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(function() {
            alert("Đăng ký thành công!");
            window.location.href = "login.html";
        })
        .catch(function(error) {
            console.error(error);
            alert("Lỗi đăng ký: " + error.message);
        });
});