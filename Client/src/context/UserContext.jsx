import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';

export const UserContext = createContext({
    userData: {},
    isChecking: true,
    setUserData: ()=>{},
    selectedUser: undefined,
    setSelectedUser: ()=>{},
    isLoggedIn: ()=>{},
    users: [],
    setUsers: ()=>{},
    fetchUsers: ()=>{},
    isLoading: false, 
    setIsLoading: ()=>{}
});

const UserContextProvider = ({children}) => {
    const [userData, setUserData] = useState({
        userId: undefined,
        username: '',
        name:'',
        profilePic: '',
        joined: ''
    });

    const [users, setUsers] = useState([]); 
    const [selectedUser, setSelectedUser] = useState();
    const [isChecking, setIsChecking] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
     
    const isLoggedIn = async () => {
        setIsChecking(true);
        try {
            const response = await axios.get('http://localhost:3000/api/user/amILoggedIn', {withCredentials: true});
            if (response.status === 200) {
                setUserData(response.data.user);
                return true;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
        finally{
            setIsChecking(false);
        }
    }

    const fetchUsers = async () =>{
        setIsLoading(true)
        try {
            const response = await axios.get('http://localhost:3000/api/user/fetchUsers', {withCredentials: true});
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

    useEffect(()=>{
        isLoggedIn();
    }, []);

    return(
        <UserContext.Provider value={{isLoading, setIsLoading, userData, setUserData, isChecking, selectedUser, setSelectedUser, isLoggedIn, users, setUsers, fetchUsers}}>{children}</UserContext.Provider>
    )
};

export default UserContextProvider;