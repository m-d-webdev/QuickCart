import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDxxN84OUKTfkd4gMDooVRH2s2wNyiSd4U",
  authDomain: "quickcart-d49c6.firebaseapp.com",
  projectId: "quickcart-d49c6",
  storageBucket: "quickcart-d49c6.firebasestorage.app",
  messagingSenderId: "472604319310",
  appId: "1:472604319310:web:56f5bdf35f09356113ed1f"
};

const app = initializeApp(firebaseConfig);




export const auth = getAuth(app);

export const db = getFirestore(app);

export const GoogleProvider = new GoogleAuthProvider(app);
export const storage = getStorage(app);