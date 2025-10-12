// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
// import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDeK2bpq8HU8bGYLBf8fZyBJ3I8I5kuS28",
  authDomain: "vite-9fbbb.firebaseapp.com",
  projectId: "vite-9fbbb",
  storageBucket: "vite-9fbbb.firebasestorage.app",
  messagingSenderId: "588473839181",
  appId: "1:588473839181:web:2222a9a500976ef9ea7604",
  measurementId: "G-N2BNQFVE3C"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export const db = getFirestore(app);

// analytics в браузерах, где поддерживается
// isSupported().then((ok) => {
//   if (ok) getAnalytics(app);
// });
