import { useContext, useEffect, useState } from 'react';
import './Chatbox.css';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';

export default function Chatbox() {
  const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible } = useContext(AppContext);
  const [input, setInput] = useState('');

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const sendMessage = async () => {
    if (!input || !messagesId) return;

    try {
      // Update messages collection
      await updateDoc(doc(db, 'messages', messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          text: input,
          createdAt: new Date(),
        }),
      });

      // Update chats for both users
      const userIDs = [chatUser.rId, userData.id];
      for (const id of userIDs) {
        const userChatsRef = doc(db, 'chats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chatsData.findIndex((c) => c.messagesId === messagesId);
          if (chatIndex !== -1) {
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, { chatsData: userChatData.chatsData });
          }
        }
      }

      setInput('');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendImage = async (e) => {
    if (!messagesId) return;
    try {
      const file = e.target.files[0];
      if (!file) return;
      const fileUrl = await upload(file); // make sure you have your upload function

      // Add image to messages collection
      await updateDoc(doc(db, 'messages', messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          image: fileUrl,
          createdAt: new Date(),
        }),
      });

      // Update chats last message for both users
      const userIDs = [chatUser.rId, userData.id];
      for (const id of userIDs) {
        const userChatsRef = doc(db, 'chats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chatsData.findIndex((c) => c.messagesId === messagesId);
          if (chatIndex !== -1) {
            userChatData.chatsData[chatIndex].lastMessage = 'Image';
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, { chatsData: userChatData.chatsData });
          }
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Real-time messages
  useEffect(() => {
    if (!messagesId) return;

    const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
      if (res.exists()) setMessages(res.data().messages.reverse());
    });

    return () => unSub();
  }, [messagesId, setMessages]);

  if (!chatUser) {
    return (
      <div className={`chat-welcome ${chatVisible ? '' : 'hidden'}`}>
        <img src="src/assets/logo_icon.png" alt="logo" />
        <p>Chat anytime, anywhere</p>
      </div>
    );
  }

  return (
    <div className={`chat-box ${chatVisible ? '' : 'hidden'}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar || 'src/assets/profile_richard.png'} alt="" />
        <p>
          {chatUser.userData.name}{' '}
          {Date.now() - chatUser.userData.lastSeen <= 70000 && (
            <img src="src/assets/green_dot.png" alt="online" className="green-dot" />
          )}
        </p>
        <img src="src/assets/help_icon.png" alt="" className="help" />
        <img onClick={() => setChatVisible(false)} src="src/assets/arrow_icon.png" alt="" className="arrow" />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? 's-msg' : 'r-msg'}>
            {msg.image ? (
              <img className="msg-img" src={msg.image} alt="sent" />
            ) : (
              <p className="msg">{msg.text}</p>
            )}
            <div>
              <img
                src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar}
                alt=""
              />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Send a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <input type="file" id="image" accept="image/png, image/jpeg" hidden onChange={sendImage} />
        <label htmlFor="image">
          <img src="src/assets/gallery_icon.png" alt="upload" />
        </label>
        <img src="src/assets/send_button.png" alt="send" onClick={sendMessage} />
      </div>
    </div>
  );
}
