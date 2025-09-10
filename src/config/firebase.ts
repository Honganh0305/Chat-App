// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  createUserWithEmailAndPassword, 
  getAuth, 
  sendPasswordResetEmail, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCbufGJMWWgTtZAdBENQwQQqW16b8YFExw",
  authDomain: "chat-app-gs-d1938.firebaseapp.com",
  projectId: "chat-app-gs-d1938",
  storageBucket: "chat-app-gs-d1938.appspot.com",
  messagingSenderId: "643204655904",
  appId: "1:643204655904:web:8dabc7a6309543f15dc545",
  measurementId: "G-MJ83NYX800"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Signup
const signup = async (email, password, username) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, I am using chat app",
      lastSeen: Date.now(),
    });

    await setDoc(doc(db, "chats", user.uid), { chatsData: [] });

    toast.success("Signup successful!");
  } catch (error) {
    console.error(error);
    toast.error(error.code.replace("auth/", "").split("-").join(" "));
  }
};

// Login
const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("Login successful!");
  } catch (error) {
    console.error(error);
    toast.error(error.code.replace("auth/", "").split("-").join(" "));
  }
};

// Logout
const logout = async () => {
  try {
    await signOut(auth);
    toast.success("Logged out successfully");
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
};

// Reset password
const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    toast.success("Reset email sent!");
  } catch (error) {
    toast.error(error.message);
  }
};

export { signup, login, logout, resetPass, auth, db };

