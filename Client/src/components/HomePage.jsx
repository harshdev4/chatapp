import React, { useContext, useEffect, useState } from 'react'
import UserList from './UserList'
import EchoWindow from './EchoWindow'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import ChatBox from './ChatBox'
import { getSocket } from './Socket';

const HomePage = () => {
    const {userData, isChecking, selectedUser} = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
      if (!isChecking && !userData.userId) {
        navigate('/login');
        return;
      }

      if (!isChecking && userData.userId) {
      const socket = getSocket();

      const registerUser = () => {
        console.log("Connected to Socket.io");
        socket.emit("register", { userId: userData.userId });
      };
    
      // Always attempt connection in case it's not established yet
      if (!socket.connected) {
        socket.connect(); // Ensure the socket is connected
      }
    
      // Register user if already connected
      if (socket.connected) {
        registerUser();
      }
    
      // Register when the socket connects (for server restarts and fresh logins)
      socket.on("connect", registerUser);
    
      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });
    
      return () => {
        socket.off("connect", registerUser);
        socket.off("disconnect");
      };
    }
    }, [isChecking, userData.userId]);

  return (
    <>{!isChecking && userData.userId &&
        <div>
            <div className={`fixed left-0 h-full z-10 w-full sm:w-[29%] ${!selectedUser ? "block" : "hidden"} sm:block`}>
              <UserList></UserList>            
            </div>
            <div className={`${!selectedUser ? "hidden" : "block"} sm:block bg-[#fdfdfd]`}>
            {!selectedUser ? <EchoWindow></EchoWindow> : <ChatBox/>}
            </div>
        </div>
}
    </>
  )
}

export default HomePage;
