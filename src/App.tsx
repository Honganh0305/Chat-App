import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import Chat from "./pages/chat/Chat";
import Login from "./pages/login/Login";
import ProfileUpdate from "./pages/profileUpdate/ProfileUpdate";
import { ToastContainer } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { AppContext } from "./context/AppContext";

export default function App() {
  const navigate = useNavigate();
  const { loadUserData } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid);
        navigate("/chat");
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate, loadUserData]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<ProfileUpdate />} />
      </Routes>
    </>
  );
}
