import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

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

export { db, auth };