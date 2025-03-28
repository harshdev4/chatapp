import React, { useContext, useEffect, useRef, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { UserContext } from "../../context/UserContext";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [userdata, setUserData] = useState({
      username: "",
      password: ""
    })
  const [isLoading, setIsLoading] = useState(false);
  const userContext = useContext(UserContext);

  useEffect(()=>{
    if (userContext.userData.userId) {
      navigate('/');
    }
  }, [userContext.userData?.userId]);

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setUserData((prev)=> ({...prev, [name]: value}));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userdata.username || !userdata.password) {
      return;
    }
    const formData = new FormData();
    formData.append("username", userdata.username);
    formData.append("password", userdata.password);
    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:3000/api/user/login", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setIsLoading(false);
      if (response.status === 200) {
        const user = response.data.user;
        userContext.setUserData(user);
        navigate('/');
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  }

    return (
        <div className="flex justify-center w-full h-[100vh] py-[15px] bg-[url('/images/authBg.jpg')] bg-cover">
          {isLoading && <div className="absolute z-10 top-[50%] left-[50%] translate-[-50%] w-[70px] h-[70px] border-b-3 border-l-3 rounded-[50%] animate-spin"> </div> }
          <div className="flex flex-col py-[20px] w-full sm:w-1/2 gap-y-[10px] px-[10px]">
            <h1 className="text-[#25433a] text-[2.4rem] md:text-[3rem] font-bold text-center">Welcome To Echo</h1>

            <div className="flex flex-col gap-y-[12px] justify-center h-[70%] ">
            <input type="text" name="username" value={userdata.username} onChange={handleInputChange} placeholder="Username" className=" bg-white p-3 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400" required/>
            <div className="relative">
              <input type={isPasswordVisible ? 'text' : 'password'} name="password" value={userdata.password} onChange={handleInputChange} placeholder="Password" className="w-full bg-white p-3 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400" required/>
              {!isPasswordVisible ?
                <FaRegEyeSlash className="absolute right-2 top-1 translate-y-1 cursor-pointer p-2 text-[35px]" onClick={()=> setIsPasswordVisible(!isPasswordVisible)}/>
              : <FaRegEye className="absolute right-2 top-1 translate-y-1 cursor-pointer p-2 text-[35px]" onClick={()=> setIsPasswordVisible(!isPasswordVisible)}/>}
            </div>
            <button className="w-[80%] p-3 bg-[#31594ebd] text-[white] mx-auto font-semibold border border-gray-300 rounded-lg shadow-md hover:bg-[#31594e] hover:text-white transition duration-300" onClick={handleSubmit}>Login</button>
            <p className="text-sm text-[#002c20] mt-3 text-center">
              Don't have an account? 
              <Link to='/register' className="text-blue-900 hover:text-blue-700 font-semibold underline"> Signup</Link>
            </p>
          </div>
        </div>
      </div>
      );
}

export default Login
