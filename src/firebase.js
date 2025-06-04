import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword as firebaseEmailSignIn,
  createUserWithEmailAndPassword as firebaseEmailSignUp,
  signOut
} from 'firebase/auth';

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

// Google провайдер
const googleProvider = new GoogleAuthProvider();

// Яндекс провайдер
const yandexProvider = new OAuthProvider('yandex.com');

// Функции авторизации
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const signInWithYandex = async () => {
  try {
    const result = await signInWithPopup(auth, yandexProvider);
    return result.user;
  } catch (error) {
    console.error("Yandex Sign-In Error:", error);
    throw error;
  }
};

export const loginWithEmail = (email, password) => {
  return firebaseEmailSignIn(auth, email, password);
};

export const registerWithEmail = (email, password) => {
  return firebaseEmailSignUp(auth, email, password);
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign Out Error:", error);
    throw error;
  }
};