import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDwXtCiwm03EP_MVNAYvPPe1VCFe66RBks",
  authDomain: "stuby-d5e15.firebaseapp.com",
  projectId: "stuby-d5e15",
  storageBucket: "stuby-d5e15.firebasestorage.app",
  messagingSenderId: "302773368226",
  appId: "1:302773368226:web:ae63279061317f8b77eefb",
  measurementId: "G-GQPNGTVHK8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services
export const auth = getAuth(app);
export const db = getFirestore(app); // Export db for your email check
export default app;
