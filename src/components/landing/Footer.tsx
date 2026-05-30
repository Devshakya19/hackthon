import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Footer() {
  const [ping, setPing] = useState(24);

  // Simulate dynamic ping updates to make the status terminal feel "alive"
  useEffect(() => {
    const interval = setInterval(() => {
      setPing((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // change by -2 to 2
        const next = prev + delta;
        return next > 10 && next < 50 ? next : prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function handleBackToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLinkClick(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <footer className="relative border-t border-white/5 bg-gradient-to-b from-transparent to-[#050505] pt-20 pb-12 px-6 lg:px-24 overflow-hidden z-10">
      
      {/* Decorative top line with a moving indicator */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent">
        <motion.div 
          className="absolute top-[-1px] left-0 w-20 h-[3px] bg-gradient-to-r from-primary to-neon-purple rounded-full blur-[1px]"
          animate={{ left: ["0%", "100%"] }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-bg font-black text-sm shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              32
            </div>
            <div className="font-display font-black text-white tracking-widest uppercase text-sm">
              BugBounty
            </div>
          </div>
          <p className="text-xs text-text-500 leading-relaxed mt-2 max-w-xs">
            A high-stakes, 32-hour security hackathon hosted by Amity University Gwalior. Test your tactical vulnerability research skills.
          </p>
          <div className="text-xs text-text-500 mt-4">
            <span className="font-bold text-white">Contact:</span> contact@amity.edu
          </div>
        </div>

        {/* Navigation Links Column */}
        <div>
          <h4 className="text-xs font-bold font-mono tracking-[0.2em] text-white mb-6 uppercase">Navigation</h4>
          <ul className="flex flex-col gap-3 text-xs text-text-500 font-semibold">
            {["Home", "Timeline", "Tracks", "Sponsors", "FAQ"].map((link) => (
              <li key={link}>
                <button 
                  onClick={() => handleLinkClick(link.toLowerCase())} 
                  className="hover:text-primary transition-colors text-left"
                >
                  {link}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources / Legals Column */}
        <div>
          <h4 className="text-xs font-bold font-mono tracking-[0.2em] text-white mb-6 uppercase">Resources</h4>
          <ul className="flex flex-col gap-3 text-xs text-text-500 font-semibold">
            <li><a href="#" className="hover:text-primary transition-colors">Event Guidelines</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Code of Conduct</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Platform Terms</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Live Diagnostics Console Column */}
        <div>
          <h4 className="text-xs font-bold font-mono tracking-[0.2em] text-white mb-6 uppercase">System Monitor</h4>
          <div className="rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-[10px] text-text-500 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span>STATUS:</span>
              <div className="flex items-center gap-1.5 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>PING:</span>
              <span className="text-white font-bold">{ping}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>NODES:</span>
              <span className="text-neon-purple font-bold">512_SECURE</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
              <span>SYS_INTEGRITY:</span>
              <span className="text-green-400 font-bold">100%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Bottom (Socials & Copyright) */}
      <div className="max-w-6xl mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        
        {/* Copyright */}
        <div className="text-xs text-text-500 text-center sm:text-left font-medium">
          © {new Date().getFullYear()} Amity University Gwalior. All rights reserved.<br />
          <span className="text-[10px] opacity-75">Designed for the ultimate developer experience.</span>
        </div>

        {/* Social Icons & Back to top */}
        <div className="flex gap-4 items-center">
          {/* Twitter / X */}
          <a 
            href="#" 
            aria-label="Twitter"
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-500 hover:text-primary hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 transition-all duration-300 bg-white/[0.01]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a 
            href="#" 
            aria-label="Instagram"
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-500 hover:text-neon-purple hover:border-neon-purple/50 hover:shadow-[0_0_15px_rgba(191,0,255,0.4)] hover:scale-105 transition-all duration-300 bg-white/[0.01]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>

          {/* Github */}
          <a 
            href="#" 
            aria-label="Github"
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-500 hover:text-white hover:border-white/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 bg-white/[0.01]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
          </a>

          {/* Cybernetic Back-to-Top Button */}
          <button
            onClick={handleBackToTop}
            aria-label="Back to Top"
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-500 hover:text-primary hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-300 bg-white/[0.01]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </div>

      </div>

    </footer>
  );
}
