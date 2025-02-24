import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import User from './User';
import { UserContext } from '../context/UserContext';
import { IoIosLogOut } from "react-icons/io";
import { getSocket } from './Socket';
import { IoMdSettings } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageContext } from '../context/MessageContext';
import { fetchMessages } from '../../../controllers/Message';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const {setLatestMessage} = useContext(MessageContext);
    const {userData, setUserData, setSelectedUser} = useContext(UserContext);

    useEffect(()=>{
        setIsLoading(true);
        const fetchUsers = async () =>{
            try {
                const response = await axios.get('https://chatapp-1ox3.onrender.com/api/user/fetchUsers', {withCredentials: true});
                if (response.status === 200) {
                    setUsers(response.data.users);
                }
            } catch (error) {
                console.log(error.response?.data?.message);
                toast.error(error.response?.data?.message);
                
            }
            finally{
                setIsLoading(false);
            }
        }

        const fetch = (msg)=>{
            const obj = {
                me: msg.sender == userData.userId ? msg.sender : msg.receiver,
                user: msg.sender == userData.userId ? msg.receiver : msg.sender,
                message: msg.message
            }
    
            setLatestMessage((prev) => {
                const updatedMessages = prev.filter((m) => m.user !== obj.user);
                return [...updatedMessages, obj];
            });
        }

        const socket = getSocket();
        socket.on('receiveMessage', fetch);
        socket.on('latestSendMessage', fetch);

        fetchUsers();
        return ()=>{
            socket.off('receiveMessage', fetch);
            socket.off('latestSendMessage', fetch);
        }
    }, []);

    const handleLogout = async () => {
        try {
            const socket = getSocket();
            if (socket.connected) {
                socket.disconnect();
            }
            const response = await axios.get(`https://chatapp-1ox3.onrender.com/api/user/logout`,{withCredentials: true});
            if (response.status===200) {
                const reset = {
                    userId: undefined,
                    username: '',
                    name:'',
                }
                setUserData(reset);
                setSelectedUser(undefined);
            }
        } catch (error) {
            const socket = getSocket();
            if (!socket.connected) {
                socket.connect();
            }
            console.log(error);
        }
    }
    
  return (
    <>
   <div className='bg-[#ebebebb5] overflow-y-scroll py-2 border-r-1 border-[#7e7d7d] h-full'>
   {isLoading && <div className="absolute z-10 top-[50%] left-[50%] translate-[-50%] w-[70px] h-[70px] border-b-3 border-l-3 rounded-[50%] animate-spin"> </div> }
    <div className='flex justify-between items-center px-2 mb-5'>
        <h1 className='text-2xl font-bold'>Chats</h1>
        <div className='flex gap-5'>
            <div className='relative group'>
                <IoMdSettings className='text-[1.5rem] cursor-pointer' onClick={()=> navigate('/setting')}/>
                <span className='hidden group-hover:block absolute translate-x-[-100%] top-5 p-[5px] bg-[#979494] text-white rounded-[7px]'>
                    Settings</span>
            </div>
            <div className='relative group'>
                <IoIosLogOut className='text-[1.5rem] cursor-pointer' onClick={handleLogout}/>
                <span className='hidden group-hover:block absolute translate-x-[-100%] top-5 p-[5px] bg-[#979494] text-white rounded-[7px]'>
                    Logout</span>
            </div>
        </div>
    </div>
    {users.map((user) => (
            <User 
                key={user._id}
                userId={user._id} 
                userImage={`${user.profilePic.slice(0, 50)}w_100,h_150/${user.profilePic.slice(50,)}`} 
                name={user.name} 
            />
        ))
    }
</div>

    </>
  )
}

export default UserList
