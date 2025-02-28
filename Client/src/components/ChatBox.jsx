import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../context/UserContext'
import { IoMdSend } from "react-icons/io";
import axios from 'axios';
import { getSocket } from './Socket';
import { FaArrowLeft } from "react-icons/fa";
import { LiaCheckDoubleSolid } from "react-icons/lia";

const ChatBox = () => {
    const {selectedUser, userData, setSelectedUser} = useContext(UserContext);
    const [selectedUserInfo, setSelectedUserInfo] = useState({
        userId: '',
        username: '',
        profilePic: '',
        name: '',
        socketId: undefined
    });

    const audio = useRef(new Audio('/sounds/send.mp3'));
    const [messages, setMessages] = useState([]);
    const [userStatus, setUserStatus] = useState([]);
    const messageRef = useRef();
    const messagesEndRef = useRef(null);

    const socket = getSocket();
    
    useEffect(()=>{

        const fetchSelectedUser = async () => {
            try {
                const response = await axios.get(`https://chatapp-1ox3.onrender.com/api/user/fetchSelectedUser/${selectedUser}`, {withCredentials: true});
                if (response.status === 200) {
                    setSelectedUserInfo(response.data.user);
                }
            } catch (error) {
                console.log(error);
            }
        }

        const fetchMessages = async ()=>{
            try {
                const response = await axios.get(`https://chatapp-1ox3.onrender.com/api/message/fetchMessages?sender=${userData.userId}&receiver=${selectedUser}`, {withCredentials: true});
                if (response.status === 200) {
                    const allMessages = response.data.allMessages;
                    allMessages.sort((a,b)=> new Date(a.timestamp) - new Date(b.timestamp));
                    setMessages(allMessages);
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchSelectedUser();
        fetchMessages();

        const handleIncomingMessages = (message)=>{
            if (message.sender == selectedUser) {
                setMessages((prev)=> ([...prev, message]));
                socket.emit('messageSeen', {me: userData.userId, user: selectedUser});
            }
        }

        socket.on('receiveMessage', handleIncomingMessages);

        return () => {
            socket.off('receiveMessage', handleIncomingMessages);
        };
    }, [selectedUser]);

    useEffect(()=>{
      const handleSeen = () =>{
          const tempMessages = messages.map((message) => ({
              ...message,
              seen: message.sender === userData.userId ? true : false
          }));
          setMessages(tempMessages);
      }
      socket.on('messageSeen', handleSeen);
      return () => {
          socket.off('messageSeen', handleSeen);
      }
    }, [messages]);

    useEffect(()=>{
      socket.emit('messageSeen', {me: userData.userId, user: selectedUser});
      console.log('message sent by', selectedUser, 'is seen by me');
      
    }, [selectedUser]);

    useEffect(() => {
        const handleStatus = (status) => {
            if (status.userId) {
                if (status.userId == selectedUser) {
                    setUserStatus(status.status);
                }   
            }
            else{
                setUserStatus(status.status);
            }
        };

        const setMessage = (message)=>{
            setMessages(prev => [...prev, message]);
        }
    
        if (selectedUser) {
            socket.emit('checkStatus', selectedUser);
            socket.on('getStatus', handleStatus);
            socket.on("sendMessage", setMessage)
        }
    
        return () => {
            socket.off('getStatus', handleStatus);
            socket.off("sendMessage", setMessage)
        };
    }, [selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
      }, [messages]);
    

    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!messageRef.current.value.trim()) return;
        const message = {
            sender: userData.userId,
            receiver: selectedUserInfo.userId,
            message: messageRef.current.value.trim(),
            timestamp: new Date().toISOString(),
        }
        
        socket.emit('sendMessage', message);
        setMessages(prev => [...prev, message]);
        audio.current.play();
        messageRef.current.value = '';
    }

  return (
    <div className="flex flex-col w-full h-svh bg-[#646e6c1c]">
  {selectedUserInfo.username && (
    <>
      {/* Top Profile Section */}
      <div className="sticky top-0 w-full flex items-center space-x-3 bg-[#2d5348] text-white p-2 shadow-md shadow-[#302f2fbe] z-10">
        <FaArrowLeft className="block sm:hidden" onClick={() => setSelectedUser()} />
        <div className="rounded-[50%] w-[50px] h-[50px] border border-[#00000036]">
          <img className="rounded-[50%] w-full h-full object-cover" 
               src={`${selectedUserInfo.profilePic.slice(0, 50)}w_100,h_100/${selectedUserInfo.profilePic.slice(50,)}`} 
               alt="selectedUser" />
        </div>
        <div>
          <h2 className="font-bold text-[1.1rem]">{selectedUserInfo.name}</h2>
          <span className="text-[12px]">{userStatus}</span>
        </div>
      </div>

      {/* Message List */}
      <ul className="flex-1 overflow-y-auto p-2 md:pb-12">
        {messages.map((message, index) => (
          <li key={index} className={`text-white text-[1.1rem] mb-3 flex ${message.sender == userData.userId ? 'justify-end' : 'justify-start'}`}>
            <span className={`grid grid-cols-[minmax(20px,100%)_15px] gap-2 items-end max-w-[50%] break-words py-1 px-3 rounded-[12px] ${message.sender == userData.userId ? 'bg-[#358d64]' : 'text-left bg-[#777373]'}`}>
            {message.message} {message.sender == userData.userId && message.seen && <LiaCheckDoubleSolid className='text-[15px] text-[#7acff9] font-bold'/>}
            </span>
          </li>
        ))}
        <div ref={messagesEndRef}></div>
      </ul>

      {/* Bottom Input Section (Sticky) */}
      <div className="fixed bottom-0 w-full bg-[#2d5348] p-[7px]">
        <form className="relative w-full" onSubmit={handleSubmit}>
          <input ref={messageRef} type="text" name="message" placeholder="Type a message" autoFocus autoComplete="off"
                 className="w-full p-2 pr-[45px] border border-[#00000067] rounded-[10px] outline-0 bg-[#fff] text-[#000]" />
          <button type="submit" className="absolute top-1/2 translate-y-[-50%] right-3 text-xl cursor-pointer p-1">
            <IoMdSend className="text-[#2d5348]" />
          </button>
        </form>
      </div>
    </>
  )}
</div>

  )
}

export default ChatBox
