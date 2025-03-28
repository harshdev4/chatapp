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
    const fetchLatestMessage = async (receiverId)=>{
        try {
          const response = await axios.get(`http://localhost:3000/api/message/latestMessage/${receiverId}`, {withCredentials: true});
          const msg = response.data.message;
          const obj = {
            me: msg.sender == userData.userId ? msg.sender : msg.receiver,
            user: msg.sender == userData.userId ? msg.receiver : msg.sender,
            message: msg.message && msg.message.startsWith("https") ? "image" : msg.message
          }

          setLatestMessage((prev) => {
            const updatedMessages = prev.filter((m) => m.user !== obj.user);
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