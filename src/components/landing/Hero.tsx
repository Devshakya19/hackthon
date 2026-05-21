import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Hero() {
  const { scrollY } = useScroll()
  
  // Parallax effects for high-end feel
  const yText = useTransform(scrollY, [0, 500], [0, 100])
  const opacityText = useTransform(scrollY, [0, 400], [1, 0])
  const scaleBackground = useTransform(scrollY, [0, 800], [1, 1.1])

  return (
    <section id="home" className="relative flex items-center justify-center min-h-screen py-20 overflow-hidden bg-bg">
      {/* Animated SVG Cyber Grid & Circuits */}
      <motion.div 
        style={{ scale: scaleBackground }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0, 240, 255, 0.08)" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="rgba(0, 240, 255, 0.3)" />
            </pattern>
            <linearGradient id="circuit-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
              <stop offset="50%" stopColor="#00f0ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#bf00ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#hero-grid)" />

          {/* Animated Circuit Paths */}
          <motion.path
            d="M 100 200 L 300 200 L 400 300 L 800 300 L 900 400"
            fill="none"
            stroke="url(#circuit-grad-1)"
            strokeWidth="2"
            initial={{ strokeDasharray: "1000", strokeDashoffset: "1000" }}
            animate={{ strokeDashoffset: "0" }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 1200 800 L 1000 800 L 900 700 L 500 700 L 400 600"
            fill="none"
            stroke="url(#circuit-grad-1)"
            strokeWidth="2"
            initial={{ strokeDasharray: "1000", strokeDashoffset: "-1000" }}
            animate={{ strokeDashoffset: "0" }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Cybernetic glowing background shapes */}
        <div className="absolute top-[10%] left-[-5%] w-[45vw] h-[45vw] bg-primary/10 rounded-full blur-[140px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-5%] w-[45vw] h-[45vw] bg-neon-purple/10 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDelay: '3s' }} />
      </motion.div>

      {/* Main Content Area */}
      <div className="center-max px-6 lg:px-24 relative z-10 w-full">
        <motion.div 
          style={{ y: yText, opacity: opacityText }}
          className="text-center"
        >
          {/* Tech Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.1)]"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Amity University Gwalior — 21 August 2026
          </motion.div>
          
          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-tight text-white select-none">
            <motion.span 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="block mb-2 font-display"
            >
              32HR BUGBOUNTY
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-gradient animate-glow inline-block font-display filter drop-shadow-[0_0_30px_rgba(0,240,255,0.2)]"
            >
              HACKATHON
            </motion.span>
          </h1>
          
          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 text-lg sm:text-xl text-text-500 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Build. Secure. Innovate. Deploy your skills in a high-stakes 32-hour arena simulating real-world zero-day vulnerabilities and cryptographic exploits.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6"
          >
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-bg font-extrabold text-lg hover:shadow-[0_0_35px_rgba(0,240,255,0.5)] hover:scale-105 transition-all duration-300 transform text-center"
            >
              Register Team
            </Link>
            <a 
              href="#about" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 text-center"
            >
              Explore Console
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => document.getElementById('tracks')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-xs uppercase tracking-widest text-text-500 font-bold">Scroll Console</span>
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1.5">
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </section>
  )
}
