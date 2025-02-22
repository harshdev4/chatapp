import { useContext, useEffect } from 'react';
import Register from './components/auth_pages/Register';
import { Route, Routes } from 'react-router-dom';
import Login from './components/auth_pages/Login';
import HomePage from './components/HomePage';
import SettingPage from './components/SettingPage';
import { Toaster } from 'react-hot-toast';
function App() {

  return (
    <>
    <Routes>
      <Route path='/' element={<HomePage/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/setting' element={<SettingPage/>}/>
    </Routes>
    <Toaster></Toaster>
    </>
  )
}

export default App
