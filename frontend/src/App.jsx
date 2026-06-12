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
import ResumeTailor from './pages/ResumeTailor';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import STARBuilder from './pages/STARBuilder';
import OutreachHelper from './pages/OutreachHelper';

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 overflow-x-hidden">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/service" element={<ProtectedRoute><Dashboard  /></ProtectedRoute>}/>
      <Route path="/pricing" element={<Pricing/>}/>
      <Route path="/success" element={<Success/>}/>
      <Route path="/interview" element={<ProtectedRoute><InterviewPage/></ProtectedRoute>}/>
      <Route path="/resume" element={<ProtectedRoute><ResumeTailor/></ProtectedRoute>}/>
      <Route path="/coverletter" element={<ProtectedRoute><CoverLetterGenerator/></ProtectedRoute>}/>
      <Route path="/star" element={<ProtectedRoute><STARBuilder/></ProtectedRoute>}/>
      <Route path="/outreach" element={<ProtectedRoute><OutreachHelper/></ProtectedRoute>}/>
    </Routes>
    </div>
  )
}

export default App
