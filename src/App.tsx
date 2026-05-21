import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/router'
import { AuthProvider } from './context/AuthContext'

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
