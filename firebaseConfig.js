import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth"; // Added these imports
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add this

const firebaseConfig = {
  apiKey: "AIzaSyDwXtCiwm03EP_MVNAYvPPe1VCFe66RBks",
  authDomain: "stuby-d5e15.firebaseapp.com",
  projectId: "stuby-d5e15",
  storageBucket: "gs://stuby-d5e15.firebasestorage.app",
  messagingSenderId: "302773368226",
  appId: "1:302773368226:web:ae63279061317f8b77eefb",
  measurementId: "G-GQPNGTVHK8",
};

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Auth with Persistence
// We initialize it ONCE and assign it to a constant
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// 3. Initialize Firestore
const db = getFirestore(app);

// 4. Export everything properly
export { auth, db };
export const storage = getStorage(app); // Export this
export default app;
