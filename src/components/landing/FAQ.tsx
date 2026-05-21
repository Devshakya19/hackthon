import React from 'react'
import { motion } from 'framer-motion'

const faqs = [
  {q:'Team size?', a:'Teams up to 4 members.'},
  {q:'Overnight stay allowed?', a:'Limited arrangements will be provided for late-night hacking.'},
  {q:'Hidden code difficulty?', a:'Challenging — expect real-world debugging and vulnerability hunting.'},
  {q:'Internet allowed?', a:'Yes, full internet access is permitted during the event.'},
  {q:'Submission process?', a:'Submit your solution via the Submission Portal before the deadline.'},
  {q:'Technologies allowed?', a:'All mainstream web and security tooling allowed. No restrictions.'}
]

export default function FAQ(){
  return (
    <div id="faq" className="max-w-4xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h3 className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">FAQ</h3>
        <h2 className="text-4xl md:text-5xl font-bold text-text-900 drop-shadow-md">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((f,idx)=> (
          <motion.details key={f.q} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:idx*0.05}} className="glass-card rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors" whileTap={{scale:0.995}}>
            <summary className="cursor-pointer font-bold text-lg text-white p-2 list-none flex justify-between items-center group">
              {f.q}
              <span className="text-primary group-open:rotate-45 transition-transform duration-200 text-2xl">+</span>
            </summary>
            <div className="mt-4 px-2 pb-2 text-text-500 leading-relaxed border-t border-white/10 pt-4">{f.a}</div>
          </motion.details>
        ))}
      </div>
    </div>
  )
}
