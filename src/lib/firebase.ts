import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwGtDReuVfU76KGeViVWVkJUUSIDYc52o",
  authDomain: "medcare-88ab2.firebaseapp.com",
  projectId: "medcare-88ab2",
  storageBucket: "medcare-88ab2.firebasestorage.app",
  messagingSenderId: "525587047531",
  appId: "1:525587047531:web:7145e9d82f45cd8ab03d2e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
