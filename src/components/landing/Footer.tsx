import React from 'react'

export default function Footer(){
  return (
    <footer className="py-10 px-6 lg:px-24 border-t border-white/10 bg-bg mt-12 relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-bg font-extrabold text-xs">32</div>
          <div>
            <div className="font-bold text-white tracking-wide">32HR BugBounty Hackathon</div>
            <div className="text-xs text-text-500">Amity University Gwalior • contact@amity.edu</div>
          </div>
        </div>
        <div className="text-sm text-text-500 font-medium">© {new Date().getFullYear()} Amity University Gwalior. All rights reserved.</div>
      </div>
    </footer>
  )
}
