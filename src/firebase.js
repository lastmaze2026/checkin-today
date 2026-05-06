import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEvO6jTWVWPzVQD7sYSt7cE9BZJzaIGfo",
  authDomain: "check-in-today-fe1ec.firebaseapp.com",
  projectId: "check-in-today-fe1ec",
  storageBucket: "check-in-today-fe1ec.firebasestorage.app",
  messagingSenderId: "1064972204431",
  appId: "1:1064972204431:web:ff1d85bdba69c8d867b3fa"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence);

const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
};
