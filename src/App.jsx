import { useState } from 'react'
import './App.css'
import {useDispatch, useSelector} from "react-redux"
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import HomePage from './Pages/HomePage'
import SignUpPage from './Pages/SignUpPage'
import LoginPage from './Pages/LoginPage'
import { useEffect } from 'react'
import { checkAuth } from './store/AuthStore/AuthSlice'

function App() {

    const dispatch = useDispatch();
    const { authUser, isCheckingAuth, onlineUsers } = useSelector((state) => state.auth); 

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading....
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
      </Routes>

      {/* <Routes>
        <Route path="/" element= {<HomePage /> } />
        <Route path="/signup" element={ <SignUpPage /> } />
        <Route path="/login" element={ <LoginPage />} />
      </Routes> */}

      <Toaster/>

    </>
  )
}

export default App
