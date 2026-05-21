import React from 'react'

export default function HiddenCode(){
  return (
    <section id="about" className="py-20 bg-bg relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-bg to-bg opacity-70 pointer-events-none" />
      <div className="center-max px-6 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">About The Event</h3>
          <h2 className="text-4xl md:text-5xl font-bold text-text-900 drop-shadow-md">A Focused 32-Hour Hackathon</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="glass-card border border-white/10 hover:border-primary/30 transition-colors flex flex-col justify-center">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">01</span>
              The Challenge
            </h4>
            <p className="text-text-500 leading-relaxed">The 32HR BugBounty Hackathon brings together top students and professionals to collaboratively solve real-world security challenges. Teams will hunt for hidden payloads and unlock complex problem statements.</p>
            <ul className="mt-6 space-y-3 text-sm text-gray-300 font-medium">
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> Team-based development environment</li>
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> Hidden-code cryptography to unlock problems</li>
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> Real-world vulnerability analysis and defense</li>
            </ul>
          </div>

          <div className="glass-card border border-white/10 hover:border-neon-purple/30 transition-colors bg-gradient-to-br from-white/[0.02] to-neon-purple/[0.02] flex flex-col justify-center">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-neon-purple/20 text-neon-purple flex items-center justify-center text-sm">02</span>
              How Hidden Code Works
            </h4>
            <p className="text-text-500 leading-relaxed">Each team leader will be tasked with finding hidden cryptographic tokens strategically placed within the event site. These tokens unlock unique problem sets and zero-day simulations assigned dynamically to teams. Only the vigilant survive.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
