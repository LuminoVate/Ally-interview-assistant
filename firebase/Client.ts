// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "@firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbiyqNCrG3EYCa3N_6f3zx6gwozufbXMU",
  authDomain: "ally-797eb.firebaseapp.com",
  projectId: "ally-797eb",
  storageBucket: "ally-797eb.firebasestorage.app",
  messagingSenderId: "330427466002",
  appId: "1:330427466002:web:05ac44b67194d40a1f33cb",
  measurementId: "G-BGSY79Y8TZ",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
