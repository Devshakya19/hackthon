import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // 21 August 2026
    const targetDate = new Date("2026-08-21T00:00:00").getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeBlocks = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECS", value: timeLeft.seconds },
  ];

  return (
    <div id="about" className="center-max relative z-10 w-full pt-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card relative overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-10 md:p-16 flex flex-col md:flex-row items-center justify-between shadow-2xl"
      >
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
        
        <div className="mb-10 md:mb-0 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-xs uppercase tracking-[0.2em] text-text-500 font-bold">System Initialization</h3>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Awaiting Protocol <span className="text-gradient">Launch.</span>
          </h2>
          <p className="text-text-500 max-w-sm text-sm leading-relaxed">
            The mainframe unlocks on August 21st. Prepare your toolkits, assemble your squad, and get ready to infiltrate.
          </p>
        </div>

        <div className="flex gap-4 md:gap-6 z-10">
          {timeBlocks.map((block, i) => (
            <div key={block.label} className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-3 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                <span className="text-2xl md:text-5xl font-display font-bold text-white tabular-nums tracking-tighter">
                  {block.value.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] md:text-xs font-bold text-text-500 tracking-widest">{block.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
