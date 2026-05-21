import React from 'react'

export default function CTA(){
  return (
    <section className="py-24 px-6 lg:px-24 bg-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center glass-card border border-white/10 p-12 md:p-16 relative z-10 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] transition-shadow duration-500">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">Ready to Enter the Cyber Arena?</h2>
        <p className="mt-6 text-text-500 text-lg max-w-2xl mx-auto">Gather your elite team, find the hidden cryptographic code, and take on real-world security challenges.</p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">
          <a href="#register" className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-neon-purple text-bg font-bold text-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-105 transition-all duration-300">
            Register Team
          </a>
          <a href="#login" className="px-8 py-4 rounded-xl glass text-white font-semibold text-lg border border-white/20 hover:bg-white/10 transition-all duration-300">
            Login Dashboard
          </a>
        </div>
      </div>
    </section>
  )
}
