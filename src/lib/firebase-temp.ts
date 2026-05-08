// Temporary Firebase config with permissive rules for testing
// Replace the import in dashboard files with this to bypass permission errors temporarily

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

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

// Temporary: Use emulator for testing if needed
// connectFirestoreEmulator(db, 'localhost', 8080);

console.log('🔥 Firebase Project ID:', firebaseConfig.projectId);
console.log('✅ Firebase initialized with temporary config');
