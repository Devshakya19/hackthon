// src/main.tsx - entry
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import './styles/animations.css'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
