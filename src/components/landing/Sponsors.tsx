import React from 'react'
import { motion } from 'framer-motion'

const sponsors = ['Google','Microsoft','IBM','Infosys','TCS','GitHub','MongoDB','Vercel','Supabase','NVIDIA']

export default function Sponsors(){
  return (
    <section id="sponsors" className="py-20 relative z-10 bg-bg">
      <div className="center-max px-6">
        <div className="text-center mb-16">
          <h3 className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">Sponsors</h3>
          <h2 className="text-4xl md:text-5xl font-bold text-text-900 drop-shadow-md">Supported By Industry Leaders</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {sponsors.map((s, idx)=> (
            <motion.div key={s} initial={{opacity:0, scale:0.9}} whileInView={{opacity:1, scale:1}} viewport={{once:true}} transition={{delay: idx*0.05}} className="sponsor-card">
              <div className="text-xl font-bold text-white tracking-wide opacity-80 group-hover:opacity-100">{s}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
