import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Clock, Terminal, Flag, Trophy, ShieldAlert } from "lucide-react";

const events = [
  { time: "Day 1 - 09:00 AM", title: "Registration & Briefing", desc: "Get your credentials, connect to the VPN, and attend the rules briefing.", icon: Terminal },
  { time: "Day 1 - 10:00 AM", title: "Hackathon Commences", desc: "The CTF infrastructure goes live. May the best hackers win.", icon: Flag },
  { time: "Day 1 - 08:00 PM", title: "Zero-Day Drop", desc: "A surprise highly-vulnerable machine is introduced to the network.", icon: ShieldAlert },
  { time: "Day 2 - 04:00 PM", title: "Network Shutdown", desc: "Access is revoked. Final flags must be submitted.", icon: Clock },
  { time: "Day 2 - 06:00 PM", title: "Closing Ceremony", desc: "Winners announced, prizes distributed, and write-ups reviewed.", icon: Trophy },
];

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div id="timeline" className="center-max relative w-full pt-32 pb-20 px-4 md:px-0" ref={containerRef}>
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
          Event <span className="text-gradient">Timeline</span>
        </h2>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Background Line */}
        <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 -translate-x-1/2 rounded-full" />
        
        {/* Animated Progress Line */}
        <motion.div 
          style={{ scaleY, originY: 0 }}
          className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-neon-purple to-primary -translate-x-1/2 rounded-full shadow-[0_0_15px_#00f0ff]" 
        />

        <div className="flex flex-col gap-12 md:gap-24">
          {events.map((event, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div 
                key={event.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Center Node */}
                <div className="absolute left-[28px] md:left-1/2 w-4 h-4 bg-bg border-2 border-primary rounded-full -translate-x-1/2 z-10 mt-1.5 md:mt-0 shadow-[0_0_10px_#00f0ff]" />

                {/* Content */}
                <div className={`ml-16 md:ml-0 w-full md:w-1/2 ${isEven ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'}`}>
                  <div className="glass-card p-6 rounded-2xl hover:bg-white/[0.04] transition-colors border-white/10 group">
                    <div className={`flex items-center gap-3 mb-3 ${!isEven ? 'md:justify-end' : ''}`}>
                      <event.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold tracking-widest text-primary uppercase">{event.time}</span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-text-500 text-sm leading-relaxed">{event.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
