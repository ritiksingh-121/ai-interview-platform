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
import FeedbackDashboard from './pages/FeedbackDashboard';
import InterviewHistory from './pages/InterviewHistory';
import Roadmap from './pages/Roadmap';
import DailyChallenge from './pages/DailyChallenge';
import HRInterview from './pages/HRInterview';
import CodeReview from './pages/CodeReview';
import CodingInterview from './pages/CodingInterview';
import VoiceInterview from './pages/VoiceInterview';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CareerCoach from './pages/CareerCoach';
import GitHubAnalysis from './pages/GitHubAnalysis';
import PortfolioAnalysis from './pages/PortfolioAnalysis';

function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/service" element={<ProtectedRoute><Dashboard  /></ProtectedRoute>}/>
      <Route path="/pricing" element={<Pricing/>}/>
      <Route path="/success" element={<Success/>}/>
      <Route path="/interview" element={<ProtectedRoute><InterviewPage/></ProtectedRoute>}/>
      <Route path="/feedback" element={<ProtectedRoute><FeedbackDashboard/></ProtectedRoute>}/>
      <Route path="/history" element={<ProtectedRoute><InterviewHistory/></ProtectedRoute>}/>
      <Route path="/roadmap" element={<ProtectedRoute><Roadmap/></ProtectedRoute>}/>
      <Route path="/resume" element={<ProtectedRoute><ResumeTailor/></ProtectedRoute>}/>
      <Route path="/coverletter" element={<ProtectedRoute><CoverLetterGenerator/></ProtectedRoute>}/>
      <Route path="/star" element={<ProtectedRoute><STARBuilder/></ProtectedRoute>}/>
      <Route path="/outreach" element={<ProtectedRoute><OutreachHelper/></ProtectedRoute>}/>
      <Route path="/challenge" element={<ProtectedRoute><DailyChallenge/></ProtectedRoute>}/>
      <Route path="/hr" element={<ProtectedRoute><HRInterview/></ProtectedRoute>}/>
      <Route path="/code-review" element={<ProtectedRoute><CodeReview/></ProtectedRoute>}/>
      <Route path="/coding" element={<ProtectedRoute><CodingInterview/></ProtectedRoute>}/>
      <Route path="/voice" element={<ProtectedRoute><VoiceInterview/></ProtectedRoute>}/>
      <Route path="/recruiter" element={<ProtectedRoute><RecruiterDashboard/></ProtectedRoute>}/>
      <Route path="/coach" element={<ProtectedRoute><CareerCoach/></ProtectedRoute>}/>
      <Route path="/github" element={<ProtectedRoute><GitHubAnalysis/></ProtectedRoute>}/>
      <Route path="/portfolio" element={<ProtectedRoute><PortfolioAnalysis/></ProtectedRoute>}/>
    </Routes>
    </div>
  )
}

export default App
