import { createContext, useState, useEffect } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const data = userSnap.data();
      setUserData({ id: uid, ...data });

      await updateDoc(userRef, { lastSeen: Date.now() });

      const id = setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, { lastSeen: Date.now() });
        }
      }, 60000);
      // cleanup interval on unmount
      return () => clearInterval(id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data().chatsData;
        const tempData = [];
        for (const item of chatItems) {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          const otherUserData = userSnap.data();
          tempData.push({ ...item, userData: otherUserData });
        }
        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      });
      return () => unSub();
    }
  }, [userData]);

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        chatData,
        setChatData,
        loadUserData,
        messages,
        setMessages,
        messagesId,
        setMessagesId,
        chatUser,
        setChatUser,
        chatVisible,
        setChatVisible,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
