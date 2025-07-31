import React, { useContext, useEffect, useRef, useState } from 'react'
import { FaCamera } from "react-icons/fa";
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { IoMdSettings } from 'react-icons/io';
import axios from 'axios';
import toast from 'react-hot-toast';

const SettingPage = () => {
    const { userData, setUserData, isLoggedIn } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const fileRef = useRef();
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState();
    const formData = new FormData();
    const [isUser, setIsUser] = useState(false);
    useEffect(()=>{
        if (!userData.userId) {
            console.log("no userId");
            
            if(!isLoggedIn()){
                navigate('/login')
            }
            else{
                setIsUser(true);
            }
        }
        else{
            console.log("yes userId");
            setIsUser(true);
        }
    }, [userData]);

    const uploadProfileImage = async () =>{
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/user/uploadProfileImage', formData,
                { withCredentials: true});
            setUserData((prev)=> {
                return {...prev, profilePic: response.data.userProfile}
                }
            )
            toast.success("Profile Changed");
            
        } catch (error) {
            toast.error("Error in updating profile");
            console.log(error);
        }
        finally{
            setIsLoading(false);
        }
    }

    const handleSelectFile = (e) =>{
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        formData.append("profilePic", file)
        const profileUrl = URL.createObjectURL(file);
        setProfileImage(profileUrl);
        uploadProfileImage();
    }

  return (<>
    {isUser && userData.username && userData.name && <div className='w-full h-[100vh] flex justify-center items-center sm:justify-normal'>
        {isLoading && <div className="absolute z-10 top-[50%] left-[50%] translate-[-50%] w-[70px] h-[70px] border-b-3 border-l-3 rounded-[50%] animate-spin"> </div> }
        <div className='grid grid-rows-[1fr_max-content_1fr_1fr_1fr] gap-[25px] w-[90%] h-[70vh] m-auto sm:w-[500px] rounded-[12px] shadow-[0_0_7px_black] p-4 bg-white'>
            <div className='flex justify-center items-center gap-2.5'>
                <IoMdSettings size={30}/> 
                <h1 className='text-center text-4xl font-semibold'>Setting</h1>
            </div>
            
            {/* image section */}
            <div className="imageSection w-full flex flex-col gap-2.5 items-center">
                <div className='relative w-32 h-32 rounded-full border-2 border-[#949191] shadow-[0_0_3px_black_inset] overflow-hidden'>
                    <input ref={fileRef} type="file" name="profilePic" className='hidden' onChange={handleSelectFile}/>
                    <img src={profileImage ? profileImage : `${userData.profilePic.slice(0, 50)}w_150,h_150/${userData.profilePic.slice(50,)}`} alt="profile" className='rounded-full w-full h-full object-cover'/>
                    <FaCamera className='absolute bottom-4 right-5 shadow-md text-[#b4b2b2] cursor-pointer' size={20} onClick={()=>fileRef.current.click()}/>
                </div>
                <p className='text-[0.8rem] text-[#73767b] text-center'>Click the camera icon to change the profile</p>
            </div>
            <div className='rounded-[12px] flex items-center p-3 bg-[#68666650] text-[#4b4a4a]'>{userData.username}</div>
            <div className='rounded-[12px] flex items-center p-3 bg-[#68666650] text-[#4b4a4a]'>{userData.name}</div>
            <div className='flex justify-between px-2'><span className='text-[#2c2c2c]'>Member Since </span><span className='text-[#424242] text-[0.9rem]'>{userData.joined.split('T')[0]}</span></div>
        </div>
      
    </div>}</>
  )
}

export default SettingPage
