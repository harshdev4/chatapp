import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({
    userData: {},
    isChecking: true,
    setUserData: ()=>{},
    selectedUser: undefined,
    setSelectedUser: ()=>{},
    isLoggedIn: ()=>{}
});

const UserContextProvider = ({children}) => {
    const [userData, setUserData] = useState({
        userId: undefined,
        username: '',
        name:'',
        profilePic: ''
    });

    const [selectedUser, setSelectedUser] = useState();
    const [isChecking, setIsChecking] = useState(true);
     
    const isLoggedIn = async () => {
        setIsChecking(true);
        try {
            const response = await axios.get('https://chatapp-1ox3.onrender.com/api/user/amILoggedIn', {withCredentials: true});
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

    useEffect(()=>{
        isLoggedIn();
    }, []);

    return(
        <UserContext.Provider value={{userData, setUserData, isChecking, selectedUser, setSelectedUser, isLoggedIn}}>{children}</UserContext.Provider>
    )
};

export default UserContextProvider;