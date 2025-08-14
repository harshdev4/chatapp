import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../context/UserContext'
import { IoMdSend } from "react-icons/io";
import axios from 'axios';
import { getSocket } from './Socket';
import { FaArrowLeft } from "react-icons/fa";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import toast from 'react-hot-toast';
import { MdPermMedia } from "react-icons/md";
import MediaPreview from './MediaPreview';
import Resizer from 'react-image-file-resizer';

const ChatBox = () => {
  const { selectedUser, userData, setSelectedUser } = useContext(UserContext);
  const [selectedUserInfo, setSelectedUserInfo] = useState({
    userId: '',
    username: '',
    profilePic: '',
    name: '',
    socketId: undefined
  });

  const audio = useRef(new Audio('/sounds/send.mp3'));
  const [mediaSrc, setMediaSrc] = useState(null);
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userStatus, setUserStatus] = useState();
  const messageRef = useRef();
  const messagesEndRef = useRef(null);
  const mediaRef = useRef();

  const socket = getSocket();

  useEffect(() => {

    const fetchSelectedUser = async () => {
      try {
        const response = await axios.get(`https://chatapp-1ox3.onrender.com/api/user/fetchSelectedUser/${selectedUser}`, { withCredentials: true });
        if (response.status === 200) {
          setSelectedUserInfo(response.data.user);
        }
      } catch (error) {
        console.log(error);
      }
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`https://chatapp-1ox3.onrender.com/api/message/fetchMessages?sender=${userData.userId}&receiver=${selectedUser}`, { withCredentials: true });
        if (response.status === 200) {
          const allMessages = response.data.allMessages;
          allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setMessages(allMessages);
        }
      } catch (error) {
        console.log(error);
      }
    }

    const handleIncomingMessages = (message) => {
      if (message.sender == selectedUser) {
        setMessages((prev) => ([...prev, message]));
        socket.emit('messageSeen', { me: userData.userId, user: selectedUser });
      }
    }

    const handleStatus = (status) => {
      if (status.userId) {
        if (status.userId == selectedUser) {
          setUserStatus(status.status);
        }
      }
      else {
        setUserStatus(status.status);
      }
    };

    const setMessage = (message) => {
      setMessages(prev => [...prev, message]);
    }

    fetchSelectedUser();
    fetchMessages();

    if (selectedUser) {
      socket.emit('checkStatus', selectedUser);
      socket.on('getStatus', handleStatus);
      socket.on("sendMessage", setMessage)
    }

    socket.emit('messageSeen', { me: userData.userId, user: selectedUser });

    socket.on('receiveMessage', handleIncomingMessages);

    return () => {
      socket.off('receiveMessage', handleIncomingMessages);
      socket.off('getStatus', handleStatus);
      socket.off("sendMessage", setMessage)
    };
  }, [selectedUser]);

  useEffect(() => {
    const handleSeen = () => {
      const tempMessages = messages.map((message) => ({
        ...message,
        seen: message.sender === userData.userId ? true : false
      }));
      setMessages(tempMessages);
    }

    messagesEndRef.current?.scrollIntoView();

    socket.on('messageSeen', handleSeen);
    return () => {
      socket.off('messageSeen', handleSeen);
    }
  }, [messages, messagesEndRef.current]);

  const openMedia = () => {
    mediaRef.current.click();
  }

  const handleMedia = (e) => {
    const imgFile = e.target.files[0];
    if (!imgFile) {
      return;
    }
    try {
      Resizer.imageFileResizer(
        imgFile,             // the file from input
        1000,              // max width (adjust as needed)
        1000,              // max height (adjust as needed)
        'JPEG',           // output format (can be 'JPEG', 'PNG', etc.)
        50,               // quality (0-100)
        0,                // rotation (if needed)
        (uri) => {        // callback function that receives the output URI
          setFile(uri);
        },
        'base64'          // output type (can be 'base64' or 'blob')
      );
    } catch (err) {
      console.error(err);
    }
    // const profileUrl = URL.createObjectURL(file);
    // setMediaSrc(profileUrl);
  }

  const sendFile = () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    // Ensure the correct format
    const base64Image = `data:image/jpeg;base64,${file.split(',')[1]}`;

    socket.emit("sendMessage", {
      sender: userData.userId,
      receiver: selectedUserInfo.userId,
      message: {
        fileName: "image.jpg",
        fileType: "image/jpeg",
        fileSize: file.length,
        fileData: base64Image,  // Now it has the MIME type
        type: "image"
      }
    });

    audio.current.play();

    const message = {
      sender: userData.userId,
      receiver: selectedUserInfo.userId,
      message: base64Image, // Ensuring correct format
      timestamp: new Date().toISOString(),
      type: "image"
    };

    setMessages(prev => [...prev, message]);
    setFile(null);
    setMediaSrc(null);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageRef.current.value.trim()) return;
    const message = {
      sender: userData.userId,
      receiver: selectedUserInfo.userId,
      message: messageRef.current.value.trim(),
      timestamp: new Date().toISOString(),
      type: "text"
    }

    socket.emit('sendMessage', message);
    setMessages(prev => [...prev, message]);
    audio.current.play();
    messageRef.current.value = '';
  }

  return (
    <div className="flex flex-col pl-[29%] w-full">
      {selectedUserInfo.username && (
        <>
          {/* Top Profile Section */}
          <div className="sticky top-0 left-0 w-full h-[60px] flex items-center space-x-3 bg-[#2d5348] text-white p-2 shadow-sm shadow-[#302f2fbe] z-5">
            <FaArrowLeft className="block sm:hidden" onClick={() => setSelectedUser()} />
            <div className="rounded-[50%] w-[50px] h-[50px] border border-[#00000036]">
              <img className="rounded-[50%] w-full h-full object-cover"
                src={`${selectedUserInfo.profilePic.slice(0, 50)}w_100/${selectedUserInfo.profilePic.slice(50,)}`}
                alt="selectedUser" />
            </div>
            <div>
              <h2 className="font-bold text-[1.1rem]">{selectedUserInfo.name}</h2>
              <span className="text-[12px]">{userStatus}</span>
            </div>
          </div>

          {/* Message List */}
          {file ? <MediaPreview mediaSrc={file} /> :
            <ul className="flex-1 overflow-y-auto px-2 pt-[15px] pb-[60px] sm:py-[15px]">
              {messages.map((message, index) => (
                <li key={index} className={`text-white text-[1.1rem] mb-3 flex ${message.sender == userData.userId ? 'justify-end' : 'justify-start'}`}>
                  {message.type === "text" ? <span className={`grid grid-cols-[minmax(20px,100%)_15px] gap-2 items-end max-w-[50%] break-words py-1 px-3 rounded-[12px] ${message.sender == userData.userId ? 'bg-[#358d64]' : 'text-left bg-[#777373]'}`}>
                    {message.message} {message.sender == userData.userId && message.seen && <LiaCheckDoubleSolid className='text-[15px] text-[#7acff9] font-bold' />}
                  </span>
                    : <span className='relative'><img src={message.message} alt="message-image" loading='lazy' className='max-w-[250px] max-h-[200px] object-cover rounded-[15px]' />{message.sender == userData.userId && message.seen && <LiaCheckDoubleSolid className='absolute right-3 bottom-1 text-[15px] text-[#6ebfe7] font-bold' />}</span>
                  }
                </li>
              ))}
              <div ref={messagesEndRef}></div>
            </ul>
          }

          {/* Bottom Input Section (Sticky) */}
          {file ? <button className='px-[15px] py-[8px] mx-auto cursor-pointer rounded-[12px] text-white bg-[#2d5348] w-[max-content]' onClick={sendFile}>Send</button> :
            <div className="fixed sm:sticky bottom-0 w-full h-[55px] bg-[#2d5348] px-[7px] flex items-center">
              <form className="relative w-full" onSubmit={handleSubmit}>
                <input ref={mediaRef} type="file" name="media" accept="image/*" className='hidden' onChange={handleMedia} />
                <button type='button' className="absolute top-1/2 translate-y-[-50%] left-3 text-xl cursor-pointer p-1" onClick={openMedia}>
                  <MdPermMedia className='text-[#2d5348]' />
                </button>
                <input ref={messageRef} type="text" name="message" placeholder="Type a message" autoComplete="off"
                  className="w-full p-2 pl-[45px] pr-[45px] border border-[#00000067] rounded-[10px] outline-0 bg-[#fff] text-[#000]" />
                <button type="submit" className="absolute top-1/2 translate-y-[-50%] right-3 text-xl cursor-pointer p-1">
                  <IoMdSend className="text-[#2d5348]" />
                </button>
              </form>
            </div>
          }
        </>
      )}
    </div>

  )
}

export default ChatBox