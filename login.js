import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Sử dụng cấu hình Firebase chuẩn có chữ "q" viết thường của bạn
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

// Khởi tạo Firebase Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Xử lý sự kiện khi bấm nút Login
document.getElementById('btn-register').addEventListener("click", function (event) {
    event.preventDefault(); // Ngăn trang web bị reload lại

    // Lấy dữ liệu từ 2 ô nhập liệu (Đảm bảo ID này trùng với login.html)
    const emailInput = document.getElementById("reg-email");
    const passwordInput = document.getElementById("reg-password");

    if (!emailInput || !passwordInput) {
        alert("Lỗi hệ thống: Không tìm thấy ô nhập liệu trong HTML!");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {
        alert("Vui lòng điền đầy đủ Email và Mật khẩu!");
        return;
    }

    console.log("Đang tiến hành đăng nhập cho:", email);

    // Gọi hàm đăng nhập thực tế của Firebase
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Đăng nhập thành công!");
            window.location.href = "index.html"; // Chuyển hướng thẳng vào trang chính của bạn
        })
        .catch((error) => {
            console.error("Chi tiết lỗi:", error);
            // Bắt các trường hợp lỗi phổ biến để hiện thông báo tiếng Việt dễ hiểu
            if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
                alert("Sai tài khoản hoặc mật khẩu! Vui lòng kiểm tra lại.");
            } else {
                alert("Đăng nhập thất bại: " + error.message);
            }
        });
});