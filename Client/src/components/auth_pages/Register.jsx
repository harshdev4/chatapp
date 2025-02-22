import React, { useContext, useEffect, useRef, useState } from "react";
import { MdFileUpload } from "react-icons/md";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from "../../context/UserContext";

const Register = () => {
  const fileInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState("/images/uploadProfile.png");
  const [userdata, setUserData] = useState({
    profilePic: "",
    username: "",
    name: "",
    password: ""
  });

  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  useEffect(()=>{
    if (userContext.userData.userId) {
      navigate('/');
    }
  }, [userContext.userData?.userId]);

  const handleFileSubmit = (e) =>{
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    const imgUrl = URL.createObjectURL(file);
    setSelectedImg(imgUrl);
    setUserData((prev)=> ({...prev, profilePic: file}));
  }

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const togglePassword = (e) => {
    const passwordInput = passwordInputRef.current;
    if (passwordInput.type == "password") {
      passwordInput.type = "text";
      document.querySelector(".openEye").classList.remove("hidden");
      document.querySelector(".closeEye").classList.add("hidden");
    }
    else{
      passwordInput.type = "password"
      document.querySelector(".openEye").classList.add("hidden");
      document.querySelector(".closeEye").classList.remove("hidden");
    }
  }

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setUserData((prev)=> ({...prev, [name]: value}));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userdata.profilePic || !userdata.username || !userdata.name || !userdata.password) {
      return;
    }
    const formData = new FormData();
    formData.append("profilePic", userdata.profilePic); // Append file
    formData.append("username", userdata.username);
    formData.append("name", userdata.name);
    formData.append("password", userdata.password);
    try {
      const response = await axios.post("http://localhost:3000/api/user/register", formData, {withCredentials: true});
      if (response.status === 200) {
        const user = response.data.user;
        userContext.setUserData(user);
        navigate('/');
      }
    } catch (error) {
      console.log(error.response?.data?.message);
    }
  }

  return (
    <div className="flex justify-center w-full h-[100vh] py-[15px] bg-[url('/images/authBg.jpg')] bg-cover">
      
      <div className="flex flex-col py-[20px] w-full sm:w-1/2 gap-y-[10px] px-[10px]">
        <h1 className="text-[#25433a] text-[2.4rem] md:text-[3rem] font-bold text-center">Welcome To Echo</h1>
        {/* Profile Picture */}
        <div className="flex flex-col gap-y-[12px] justify-center h-[70%] ">
        <div className="relative 
        w-[100px] rounded-[50%] h-fit place-self-center bg-white border-3 border-gray-300 shadow-lg flex items-center justify-center" onClick={handleFileClick}>
          <img
            src={selectedImg}
            name="image"
            alt="Upload Profile"
            className="w-[100px] h-[100px] object-contain shadow-[0_15px_15px_#63030340] rounded-[50%]"
          />
          <MdFileUpload className="absolute bottom-1 right-1 bg-gray-100 p-1 rounded-full text-gray-600 text-xl" />
          <input type="file" ref={fileInputRef} className="hidden" required onChange={handleFileSubmit}/>
        </div>
  
        <input type="text" name="username" value={userdata.username} onChange={handleInputChange} placeholder="Username" className=" bg-white p-3 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400" required/>
        <input type="text" name="name" value={userdata.name} onChange={handleInputChange} placeholder="Full name" className="bg-white p-3 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400" required/>
        <div className="relative">
          <input ref={passwordInputRef} name="password" value={userdata.password} onChange={handleInputChange} type="password" placeholder="Password" className="w-full bg-white p-3 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400" required/>
          <FaRegEye className="absolute right-2 top-1 translate-y-1 cursor-pointer hidden openEye p-2 text-[35px]" onClick={togglePassword}/>
          <FaRegEyeSlash className="absolute right-2 top-1 translate-y-1 cursor-pointer closeEye p-2 text-[35px]" onClick={togglePassword}/>
        </div>
        <button className="w-[80%] p-3 bg-[#31594ebd] text-[white] mx-auto font-semibold border border-gray-300 rounded-lg shadow-md hover:bg-[#31594e] hover:text-white transition duration-300" onClick={handleSubmit}>Sign Up</button>
        <p className="text-sm text-[#002c20] mt-3 text-center">
          Already have an account? 
          <Link to='/login' className="text-blue-900 hover:text-blue-700 font-semibold underline"> Login</Link>
        </p>
      </div>
    </div>
  </div>  
  );
};

export default Register;
