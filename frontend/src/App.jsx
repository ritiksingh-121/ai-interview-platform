import React from 'react'
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import {Routes,Route} from "react-router-dom"
import Home from './pages/Home'
import Navbar from './pages/Navbar'
import ProtectedRoute from './pages/ProtectedRoute';
import Pricing from './pages/Pricing'
import Dashboard from "./pages/Dashboard";
import Success from "./pages/Success";
import InterviewPage from './pages/InterviewPage';



function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/service" element={<ProtectedRoute><Dashboard  /></ProtectedRoute>}/>
      <Route path="/pricing" element={<Pricing/>}/>
      <Route path="/success" element={<Success/>}/>
      <Route path="/interview" element={<InterviewPage/>}/>

    </Routes>
    </>
  )
}

export default App