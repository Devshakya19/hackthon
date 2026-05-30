import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

function TiltCard({ title, amount, desc, icon: Icon, color, delay }: any) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useMotionTemplate`${mouseYSpring}deg`;
  const rotateY = useMotionTemplate`${mouseXSpring}deg`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 20); // max rotation 20deg
    y.set(yPct * -20);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay }}
      style={{ perspective: 1000 }}
      className="w-full"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative w-full h-full p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.5)]`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} style={{ transform: "translateZ(-10px)" }} />
        
        <div style={{ transform: "translate3d(0, 0, 60px)" }} className="mb-6 w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-12 h-12 text-white" />
        </div>
        
        <h3 style={{ transform: "translate3d(0, 0, 40px)" }} className="text-2xl font-bold font-display text-text-500 mb-2 uppercase tracking-widest">{title}</h3>
        <div style={{ transform: "translate3d(0, 0, 50px)" }} className="text-5xl font-black font-display text-white mb-4 tracking-tighter">{amount}</div>
        <p style={{ transform: "translate3d(0, 0, 30px)" }} className="text-sm text-text-500 max-w-[200px]">{desc}</p>
      </motion.div>
    </motion.div>
  );
}

export default function Prizes() {
  return (
    <div id="prizes" className="center-max relative z-10 w-full pt-32 pb-20 px-6">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight mb-4">
          Bounty <span className="text-gradient">Rewards</span>
        </h2>
        <p className="text-text-500 max-w-2xl mx-auto">Elite rewards for the most critical vulnerabilities discovered.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <TiltCard 
          title="Runner Up" 
          amount="₹50,000" 
          desc="For high-impact bugs and advanced exploits." 
          icon={Medal} 
          color="from-blue-500 to-cyan-500" 
          delay={0.1}
        />
        <TiltCard 
          title="Grand Prize" 
          amount="₹1,00,000" 
          desc="Awarded to the ultimate Zero-Day discovery." 
          icon={Trophy} 
          color="from-yellow-400 to-orange-500" 
          delay={0.2}
        />
        <TiltCard 
          title="Third Place" 
          amount="₹25,000" 
          desc="For creative payloads and persistence mechanisms." 
          icon={Award} 
          color="from-purple-500 to-pink-500" 
          delay={0.3}
        />
      </div>
    </div>
  );
}
