import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFpS7xH0-a6USzEBESBGYPJTQg3VVZEnE",
  authDomain: "w5model.firebaseapp.com",
  projectId: "w5model",
  storageBucket: "w5model.firebasestorage.app",
  messagingSenderId: "675447198724",
  appId: "1:675447198724:web:b8f437b9c715a99ab8d151",
  measurementId: "G-ZZWW4N2HLR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign Out Error:", error);
    throw error;
  }
};