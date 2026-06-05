import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyApGckJlfyPwUWBLqpvgM5hAhEZ4k4qAZc",
    authDomain: "login-b3d7f.firebaseapp.com",
    projectId: "login-b3d7f",
    storageBucket: "login-b3d7f.firebasestorage.app",
    messagingSenderId: "265538131068",
    appId: "1:265538131068:web:6d401a92d43d426a9325f9",
    measurementId: "G-W5C10LWZWP"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);



// Xử lý sự kiện Đăng nhập
document.getElementById('btn-register').addEventListener("click", function (event) {
    event.preventDefault();
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Đăng nhập thành công!");
            window.location.href = "index.html"; 
        })
        .catch((error) => {
            alert("Đăng nhập thất bại: " + error.message);
        });
});