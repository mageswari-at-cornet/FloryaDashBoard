import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBq_YJPNccYHZ5TX1HhrR8PuMFCJDdKSfE",
    authDomain: "womenhealth-d683a.firebaseapp.com",
    projectId: "womenhealth-d683a",
    storageBucket: "womenhealth-d683a.firebasestorage.app",
    messagingSenderId: "31408155932",
    appId: "1:31408155932:web:781d3d40f31d37f0d21ed9",
    measurementId: "G-NVY4BJ8FQ6"
};

export const app = initializeApp(firebaseConfig, "florya-admin");
export const auth = getAuth(app);
export const db = getFirestore(app);
