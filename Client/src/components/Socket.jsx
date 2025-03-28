import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://chatapp-1ox3.onrender.com", { autoConnect: false }); // Prevents automatic connection
  }
  return socket;
};

