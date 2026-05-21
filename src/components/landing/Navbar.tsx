import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const links = ['Home','Timeline','Tracks','Sponsors','FAQ']

export default function Navbar(){
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleLinkClick(l: string) {
    const id = l.toLowerCase()
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setOpen(false)
  }

  return (
    <header className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrolled ? 'py-2' : 'py-6'} px-4 sm:px-8 lg:px-24`}>
      <nav className={`glass flex items-center justify-between py-3 px-6 lg:px-8 rounded-2xl transition-all duration-300 ${scrolled ? 'bg-bg/80 backdrop-blur-xl shadow-lg border-white/10' : 'bg-transparent border-transparent shadow-none'}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleLinkClick('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-bg font-extrabold text-lg shadow-[0_0_15px_rgba(0,240,255,0.4)]">32</div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">32HR</div>
            <div className="text-[10px] text-primary uppercase tracking-widest -mt-1 font-semibold">BugBounty</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l)=> (
            <button key={l} onClick={()=>handleLinkClick(l)} className="relative text-sm text-text-900 font-medium hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">{l}</button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:inline px-5 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">Login</Link>
          <Link to="/register" className="hidden sm:inline px-5 py-2 text-sm rounded-lg bg-primary text-bg font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all transform hover:scale-105">Register</Link>

          <button aria-label="menu" onClick={()=>setOpen(true)} className="md:hidden p-2 rounded-lg bg-white/5 text-white border border-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-sm flex">
            <motion.aside initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:25}} className="ml-auto w-72 bg-bg border-l border-white/10 p-6 flex flex-col h-full shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="font-bold text-white text-xl">Menu</div>
                <button onClick={()=>setOpen(false)} className="p-2 rounded-lg bg-white/5 text-white border border-white/10">✕</button>
              </div>
              <div className="flex flex-col gap-2">
                {links.map(l=> (
                  <button key={l} onClick={()=>handleLinkClick(l)} className="text-left py-3 px-4 rounded-lg font-semibold text-text-500 hover:text-primary hover:bg-white/5 transition-all">{l}</button>
                ))}
                <div className="mt-8 flex flex-col gap-3">
                  <Link to="/login" onClick={()=>setOpen(false)} className="w-full px-4 py-3 rounded-lg border border-white/10 text-white font-semibold text-center">Login</Link>
                  <Link to="/register" onClick={()=>setOpen(false)} className="w-full px-4 py-3 rounded-lg bg-primary text-bg font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] text-center">Register</Link>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
