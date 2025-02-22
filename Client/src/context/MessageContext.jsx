import axios from "axios";
import { createContext, useContext, useState } from "react";
import { UserContext } from "./UserContext";

export const MessageContext = createContext({
    latestMessage: '',
    setLatestMessage: ()=>{},
    fetchLatestMessage: ()=>{},
});

const MessageContextProvider = ({children}) =>{
    const [latestMessage, setLatestMessage] = useState([]);
    const {userData} = useContext(UserContext);
    const fetchLatestMessage = async (receiverId, message)=>{
        try {
          const response = await axios.get(`https://chatapp-1ox3.onrender.com/api/message/latestMessage/${receiverId}`, {withCredentials: true});
          const msg = response.data.message;
          if ((!msg.receiver || !msg.sender || !msg.message) && !message) {
            return
          }


          const obj = {
            receiver: msg.receiver ? (userData.userId == msg.receiver ? msg.sender : msg.receiver) : receiverId,
            message: message ? message : msg.message
          }

          setLatestMessage((prev) => {
            const updatedMessages = prev.filter((m) => m.receiver !== obj.receiver);
            return [...updatedMessages, obj];
          });
        } catch (error) {
          console.log(error);
        }
      }
    return (
        <MessageContext.Provider value={{latestMessage, setLatestMessage, fetchLatestMessage}}>{children}</MessageContext.Provider>
    )
};

export default MessageContextProvider;