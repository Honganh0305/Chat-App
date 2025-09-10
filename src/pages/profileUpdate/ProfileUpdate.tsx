import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./ProfileUpdate.css";
import { useNavigate } from "react-router-dom";
import upload from "../../lib/upload";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import avatarIcon from "../../assets/avatar_icon.png";
import logoIcon from "../../assets/logo_icon.png";

export default function ProfileUpdate() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);

  const profileUpdate = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("Please upload a profile picture");
        return;
      }

      const docRef = doc(db, "users", uid);

      if (image) {
        const imgUrl = await upload(image);
        setPrevImage(imgUrl);
        await updateDoc(docRef, {
          avatar: imgUrl,
          bio,
          name,
        });
      } else {
        await updateDoc(docRef, {
          bio,
          name,
        });
      }

      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate("/chat");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.name) setName(data.name);
          if (data.bio) setBio(data.bio);
          if (data.avatar) setPrevImage(data.avatar);
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>

          <label htmlFor="avatar">
            <input
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
            <img
              src={image ? URL.createObjectURL(image) : prevImage || avatarIcon}
              alt="profile"
            />
            Upload Profile Image
          </label>

          <input
            type="text"
            placeholder="Your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            placeholder="Write profile bio"
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>

          <button type="submit">Save</button>
        </form>

        <img
          className="profile-pic"
          src={image ? URL.createObjectURL(image) : prevImage ? prevImage : src/assets/logo_icon.png}
          alt="profile preview"
        />
      </div>
    </div>
  );
}