import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { collection, query, where, getDocs, serverTimestamp, arrayUnion, updateDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import logo from "../../assets/logo.png";
import menuIcon from "../../assets/menu_icon.png";
import searchIcon from "../../assets/search_icon.png";
import profileFallback from "../../assets/profile_richard.png";

export default function LeftSideBar() {
  const navigate = useNavigate();
  const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId, chatVisible, setChatVisible } = useContext(AppContext);

  const [foundUser, setFoundUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      setSearchValue(input);
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          const userExist = chatData.some(user => user.rId === querySnap.docs[0].data().id);
          if (!userExist) setFoundUser(querySnap.docs[0].data());
        } else {
          setFoundUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addChat = async () => {
    if (!foundUser) return;
    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");

    try {
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, { createdAt: serverTimestamp(), messages: [] });

      await updateDoc(doc(chatsRef, foundUser.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: foundUser.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      setChatUser({
        messagesId: newMessageRef.id,
        lastMessage: "",
        rId: foundUser.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: foundUser,
      });

      setMessagesId(newMessageRef.id);
      setShowSearch(false);
      setChatVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={logo} alt="Logo" />
          <div className="menu">
            <img src={menuIcon} alt="menu" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={searchIcon} alt="search" />
          <input type="text" placeholder="Search here..." value={searchValue} onChange={inputHandler} />
        </div>
      </div>
      {showSearch && (
        <div className="ls-search-results">
          {foundUser ? (
            <div className="friend clickable" onClick={addChat}>
              <img src={foundUser.photoURL || profileFallback} alt="" />
              <div>
                <p>{foundUser.displayName || foundUser.username}</p>
                <span>@{foundUser.username}</span>
              </div>
            </div>
          ) : (
            <div className="empty">No user found</div>
          )}
        </div>
      )}
      <div className="ls-list">
        {chatData.map((item, index) => (
          <div
            key={index}
            onClick={() => setChatUser(item)}
            className={`friend ${item.messageSeen || item.messageId === messagesId ? "seen" : ""}`}
          >
            <img src={item.userData.avatar || profileFallback} alt="Profile" />
            <div>
              <p>{item.userData.name}</p>
              <span>{item.lastMessage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
