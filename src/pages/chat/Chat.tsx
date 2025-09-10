import './Chat.css';
import ChatBox from '../../components/Chatbox/Chatbox';
import LeftSideBar from '../../components/LeftSideBar/LeftSideBar';
import RightSideBar from '../../components/RightSideBar/RightSideBar';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';

export default function Chat() {
  const { chatData, userData } = useContext(AppContext)!;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
  }, [chatData, userData]);

  return (
    <div className="chat">
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="chat-container">
          <LeftSideBar />
          <ChatBox />
          <RightSideBar />
        </div>
      )}
    </div>
  );
}
