import React from 'react'
import { motion } from 'framer-motion'

const day1 = ['Registration','Welcome Address','Rules Announcement','Team Allocation','Hackathon Start','Debugging Phase','Development Phase','Judging Round']
const day2 = ['Night Development','Breakfast','Final Polishing','Submission','Closing Ceremony']

function EventNode({title, side}:{title:string, side:'left'|'right'}){
  return (
    <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mb-8 md:mb-12 w-full">
      <div className={`flex w-full ${side==='left'?'justify-end':'justify-start'}`}>
        <div className="w-full md:w-1/2 group">
          <div className="glass-card p-4 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
            <div className="font-bold text-white group-hover:text-primary transition-colors">{title}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TimelineSection(){
  return (
    <div id="timeline" className="max-w-4xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h3 className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">Event Timeline</h3>
        <h2 className="text-4xl md:text-5xl font-bold text-text-900 drop-shadow-md">Two-Day Schedule</h2>
      </div>

      <div className="relative">
        {/* Central glowing line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-[2px] bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />

        <div className="space-y-2">
          {day1.map((d,i)=> (
            <div key={d} className="flex items-center">
              <div className={`w-1/2 ${i%2===0?'pr-6 text-right':'pl-6 text-left'}`}>
                {i%2===0 ? <EventNode title={d} side="left" /> : null}
              </div>
              <div className="w-10 flex justify-center z-10">
                <div className="w-5 h-5 rounded-full bg-bg border-4 border-primary shadow-[0_0_15px_rgba(0,240,255,0.6)]" />
              </div>
              <div className="w-1/2">
                {i%2===1 ? <EventNode title={d} side="right" /> : null}
              </div>
            </div>
          ))}

          {day2.map((d,i)=> (
            <div key={d} className="flex items-center">
              <div className={`w-1/2 ${i%2===0?'pr-6 text-right':'pl-6 text-left'}`}>
                {i%2===0 ? <EventNode title={d} side="left" /> : null}
              </div>
              <div className="w-10 flex justify-center z-10">
                <div className="w-5 h-5 rounded-full bg-bg border-4 border-neon-purple shadow-[0_0_15px_rgba(191,0,255,0.6)]" />
              </div>
              <div className="w-1/2">
                {i%2===1 ? <EventNode title={d} side="right" /> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
