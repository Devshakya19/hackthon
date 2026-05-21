import React from 'react'
import { motion } from 'framer-motion'

const day1 = ['Registration','Welcome Address','Rules Announcement','Team Allocation','Hackathon Start','Debugging Phase','Development Phase','Judging Round']
const day2 = ['Night Development','Breakfast','Final Polishing','Submission','Closing Ceremony']

function EventNode({title, left}:{title:string,left:boolean}){
  return (
    <motion.div className={`w-full flex ${left? 'justify-end pr-8':'pl-8'}`} initial={{opacity:0, y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
      <div className="max-w-xs glass p-4 rounded-md">
        <div className="font-semibold">{title}</div>
      </div>
    </motion.div>
  )
}

export default function TimelineClean(){
  return (
    <section id="timeline" className="py-16 bg-white">
      <div className="center-max px-6">
        <div className="text-center mb-10">
          <h3 className="text-sm uppercase muted">Event Timeline</h3>
          <h2 className="text-3xl font-bold mt-2">Two-Day Schedule</h2>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gray-200" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {day1.map((d,idx)=> (
                <div key={d} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">{idx+1}</div>
                  <div className="flex-1">
                    <EventNode title={d} left={false} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {day2.map((d,idx)=> (
                <div key={d} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">{idx+1}</div>
                  <div className="flex-1">
                    <EventNode title={d} left={true} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
