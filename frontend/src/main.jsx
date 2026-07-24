import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import { ThemeProvider } from './context/ThemeContext'
import { CameraProvider } from './context/CameraContext'

createRoot(document.getElementById('root')).render(
 <BrowserRouter>
  <ThemeProvider>
   <CameraProvider>
    <App />
   </CameraProvider>
  </ThemeProvider>
 </BrowserRouter>
)
