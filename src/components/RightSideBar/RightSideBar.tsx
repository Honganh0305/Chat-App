import React, { useContext, useEffect, useState } from 'react';
import './RightSideBar.css';
import { AppContext } from '../../context/AppContext';
import greenDot from '../../assets/green_dot.png'; // adjust if your file name differs

// Light shape of a message; expand as your data grows
interface Message {
  id?: string;
  text?: string;
  image?: string;        // URL of an image in the message
  createdAt?: number;
  [key: string]: unknown;
}

const RightSideBar: React.FC = () => {
  const { chatUser, messages } = useContext(AppContext)! as {
    chatUser: any;
    messages: Message[];
  };

  const [msgImages, setMsgImages] = useState<string[]>([]);

  // Collect image URLs from the current chat's messages
  useEffect(() => {
    const imgs =
      (messages ?? [])
        .filter((m) => m && typeof m === 'object' && 'image' in m && m.image)
        .map((m) => String((m as Message).image));
    setMsgImages(imgs);
  }, [messages]);

  if (!chatUser) return null;

  const lastSeenMs = Number(chatUser?.userData?.lastSeen ?? 0);
  const isOnline = Date.now() - lastSeenMs <= 70_000; // within 70s

  return (
    <aside className="rs">
      <div className="rs-profile">
        <img src={chatUser?.userData?.avatar || ''} alt="" />
        <h3>
          {chatUser?.userData?.name}{' '}
          {isOnline ? <img src={greenDot} className="dot" alt="" /> : null}
        </h3>
        <p>{chatUser?.userData?.bio}</p>
      </div>

      <hr />

      <div className="rs-media">
        <p>Media</p>

        <div className="rs-media-grid">
          {msgImages.map((url, index) => (
            <img
              key={`${url}-${index}`}
              src={url}
              alt=""
              onClick={() => window.open(url, '_blank')}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSideBar;
