/**
 * Abstraction to connect to the database.
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

let firebaseConfig = {
  apiKey: "AIzaSyDj2UEhT_f97CIYsFYtOgPt6zVdpv1kZGc",
  authDomain: "crawlr-1cbfd.firebaseapp.com",
  projectId: "crawlr-1cbfd",
  storageBucket: "crawlr-1cbfd.firebasestorage.app",
  messagingSenderId: "44421940468",
  appId: "1:44421940468:web:153771574c4148b76a0aa1",
  measurementId: "G-HFTLXYEQVJ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export default db;