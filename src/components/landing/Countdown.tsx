import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

function useCountdown(target: string) {
  const targetDate = new Date(target).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, targetDate - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="glass-card p-6 w-32 md:w-36 text-center border border-white/10 hover:border-primary/40 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:from-primary group-hover:to-neon-purple transition-colors duration-300">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-xs uppercase tracking-widest text-text-500 mt-2 font-semibold group-hover:text-white transition-colors">
        {label}
      </div>
    </motion.div>
  );
}

export default function Countdown() {
  const { days, hours, minutes, seconds } = useCountdown("2026-08-21T09:00:00");
  return (
    <div className="max-w-4xl mx-auto relative z-10">
      <div className="text-center mb-10">
        <h3 className="text-sm text-primary font-bold uppercase tracking-widest mb-2 shadow-primary drop-shadow-md">
          Countdown to Kickoff
        </h3>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white">
          System Activation
        </h2>
      </div>
      <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
        <Card label="Days" value={days} />
        <Card label="Hours" value={hours} />
        <Card label="Minutes" value={minutes} />
        <Card label="Seconds" value={seconds} />
      </div>
    </div>
  );
}
