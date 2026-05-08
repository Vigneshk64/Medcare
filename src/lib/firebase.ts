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

// Print Firebase project ID for debugging
console.log('🔥 Firebase Project ID:', firebaseConfig.projectId);
console.log('🔥 Firebase Config:', firebaseConfig);

let app: any;
let auth: any;
let db: any;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  console.log('🔥 Firebase App Name:', app.name);
  
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('✅ Firebase Auth initialized');
  console.log('✅ Firebase Firestore initialized');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export { auth, db };
