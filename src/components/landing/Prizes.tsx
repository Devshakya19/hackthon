import React from 'react'
import { motion } from 'framer-motion'

const prizes = [
  {title:'Winner Prize',desc:'Main trophy + ₹50,000 + internships', icon: '🏆'},
  {title:'Runner-Up',desc:'₹30,000 + swag kits', icon: '🥈'},
  {title:'Cybersecurity Excellence',desc:'Pro Security tool subscriptions', icon: '🛡️'},
  {title:'Innovation Award',desc:'Mentorship + product credits', icon: '💡'}
]

export default function Prizes(){
  return (
    <div id="prizes" className="max-w-6xl mx-auto relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="text-center mb-16">
        <h3 className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">Rewards</h3>
        <h2 className="text-4xl md:text-5xl font-bold text-text-900 drop-shadow-md">Win Big. Build Bigger.</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {prizes.map((p, idx)=> (
          <motion.div key={p.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:idx*0.1}} className="glass-card group text-center relative overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(191,0,255,0.2)]">
            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{p.icon}</div>
            <div className="text-2xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{p.title}</div>
            <div className="text-sm text-text-500 font-medium">{p.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
