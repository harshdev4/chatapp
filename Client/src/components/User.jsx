import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../context/UserContext';
import { MessageContext } from '../context/MessageContext';

const User = (props) => {
    const userProfile = useRef(undefined);
    const {selectedUser, setSelectedUser} = useContext(UserContext);
    const {latestMessage, fetchLatestMessage} = useContext(MessageContext);
    useEffect(()=>{
      fetchLatestMessage(props.userId);
    }, []);

    const handleUserSelection = (userId)=>{
      setSelectedUser(userId);
    }
    

  return (
   <>
    <div ref={userProfile} className={`grid grid-cols-[1fr_4fr] gap-2 items-center mb-4.5 md:mb-0 cursor-pointer transition-colors delay-50 px-2 ${selectedUser == props.userId && 'bg-gray-200'}  hover:bg-gray-200`}  onClick={()=> handleUserSelection(props.userId)}>
      <div className="w-[3em] h-[3em] rounded-[50%] border-1">
        <img src={props.userImage} alt="userImage" className='w-[100%] h-[100%] object-cover rounded-[50%]'/>
      </div>
      <div className='grid border-t-1 border-[#cdc9c9] py-3'>
        <h3 className='font-bold'>{props.name}</h3>
        <p className='text-[13px]  md:block truncate w-[140px]'>{latestMessage.length > 0 && latestMessage.find((msg)=> msg.receiver == props.userId)?.message}</p>
        </div>
    </div>
    </>
  )
}

export default User;
