import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent, MotionValue, useTransform } from "framer-motion";
import { Clock, Terminal, Flag, Trophy, ShieldAlert } from "lucide-react";

const events = [
  { time: "Day 1 - 09:00 AM", title: "Registration & Briefing", desc: "Get your credentials, connect to the VPN, and attend the rules briefing.", icon: Terminal },
  { time: "Day 1 - 10:00 AM", title: "Hackathon Commences", desc: "The CTF infrastructure goes live. May the best hackers win.", icon: Flag },
  { time: "Day 1 - 08:00 PM", title: "Zero-Day Drop", desc: "A surprise highly-vulnerable machine is introduced to the network.", icon: ShieldAlert },
  { time: "Day 2 - 04:00 PM", title: "Network Shutdown", desc: "Access is revoked. Final flags must be submitted.", icon: Clock },
  { time: "Day 2 - 06:00 PM", title: "Closing Ceremony", desc: "Winners announced, prizes distributed, and write-ups reviewed.", icon: Trophy },
];

interface TimelineItemProps {
  event: typeof events[0];
  idx: number;
  isEven: boolean;
  scaleY: MotionValue<number>;
}

function TimelineItem({ event, idx, isEven, scaleY }: TimelineItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useMotionValueEvent(scaleY, "change", () => {
    if (!itemRef.current) return;
    const itemRect = itemRef.current.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    setIsActive(itemRect.top + itemRect.height / 2 <= viewportCenter);
  });

  useEffect(() => {
    const handleCheck = () => {
      if (itemRef.current) {
        const itemRect = itemRef.current.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        setIsActive(itemRect.top + itemRect.height / 2 <= viewportCenter);
      }
    };
    const timer = setTimeout(handleCheck, 100);
    window.addEventListener("resize", handleCheck);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleCheck);
    };
  }, []);

  const Icon = event.icon;

  return (
    <div 
      ref={itemRef}
      className={`relative flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''} group`}
    >
      {/* Center Node (Checkpoint) */}
      <div className="absolute left-[28px] md:left-1/2 -translate-x-1/2 mt-2.5 md:mt-0 z-20 flex items-center justify-center">
        <div 
          className={`timeline-node w-5 h-5 rounded-full border-2 transition-all duration-500 ${
            isActive 
              ? "bg-primary border-primary scale-125 shadow-[0_0_30px_#00f0ff,0_0_15px_#00f0ff]" 
              : "bg-bg border-white/20 scale-100 shadow-none"
          }`} 
        />
        {/* Ripple Effect */}
        {isActive && (
          <motion.div
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute w-5 h-5 rounded-full bg-primary/40 pointer-events-none"
          />
        )}
      </div>

      {/* Content Card Wrapper */}
      <div className={`ml-16 md:ml-0 w-full md:w-1/2 ${isEven ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'}`}>
        <motion.div 
          animate={{
            x: isActive ? 0 : (isEven ? 20 : -20),
            scale: isActive ? 1.02 : 0.95,
            opacity: isActive ? 1 : 0.4,
            borderColor: isActive ? "rgba(0, 240, 255, 0.5)" : "rgba(255, 255, 255, 0.05)",
            backgroundColor: isActive ? "rgba(0, 240, 255, 0.05)" : "rgba(255, 255, 255, 0.01)",
            boxShadow: isActive ? "0 0 30px rgba(0, 240, 255, 0.1)" : "0 0 0px rgba(0,0,0,0)"
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-6 md:p-8 rounded-2xl border transition-colors relative overflow-hidden"
        >
          {/* Scanline flash when active */}
          {isActive && (
            <motion.div 
              initial={{ top: "-100%" }}
              animate={{ top: "200%" }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
              className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-primary/10 to-transparent blur-md z-[-1]"
            />
          )}

          <div className={`flex items-center gap-3 mb-3 ${!isEven ? 'md:justify-end' : ''}`}>
            <Icon className={`w-5 h-5 transition-all duration-500 ${isActive ? "text-primary scale-110 drop-shadow-[0_0_5px_#00f0ff]" : "text-text-500 scale-100"}`} />
            <span className={`text-sm font-bold tracking-widest uppercase transition-colors duration-500 ${isActive ? "text-primary" : "text-text-500"}`}>{event.time}</span>
          </div>
          <h3 className={`text-xl md:text-2xl font-display font-bold mb-2 transition-colors duration-500 ${isActive ? "text-white" : "text-text-500"}`}>{event.title}</h3>
          <p className={`text-sm md:text-base leading-relaxed transition-colors duration-500 ${isActive ? "text-text-400" : "text-text-500"}`}>{event.desc}</p>
        </motion.div>
      </div>
    </div>
  );
}

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const [height, setHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const heightProgress = useTransform(scaleY, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const updatePaths = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      setHeight(containerRect.height);
      setIsMobile(window.innerWidth < 768);
      
      const nodes = containerRef.current.querySelectorAll('.timeline-node');
      const newPoints = Array.from(nodes).map(node => {
        const rect = node.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2
        };
      });
      setPoints(newPoints);
    };
    
    updatePaths();
    const timer = setTimeout(updatePaths, 150);
    window.addEventListener('resize', updatePaths);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePaths);
    };
  }, []);

  let pathStr = "";
  if (points.length > 0) {
    pathStr += `M ${points[0].x} 0 L ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i+1];
      const H = p2.y - p1.y;
      
      const direction = i % 2 === 0 ? 1 : -1;
      const D = isMobile ? 15 * direction : Math.min(H * 0.4, 150) * direction;
      
      const cpX = p1.x + D;
      const cpY = p1.y + H / 2;
      
      pathStr += ` Q ${cpX} ${cpY}, ${p2.x} ${p2.y}`;
    }
    pathStr += ` L ${points[points.length-1].x} ${height}`;
  }

  return (
    <div id="timeline" className="center-max relative w-full pt-32 pb-20 px-4 md:px-0">
      <div className="text-center mb-24 relative z-10">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
          Event <span className="text-gradient">Timeline</span>
        </h2>
      </div>

      <div className="relative max-w-4xl mx-auto" ref={containerRef}>
        {/* SVG Roadmap Background */}
        {points.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Base dim path */}
            <svg width="100%" height={height} className="absolute top-0 left-0">
              <path 
                d={pathStr} 
                fill="none" 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            {/* Glowing active path masked by scroll */}
            <motion.div 
              style={{ height: heightProgress }}
              className="absolute top-0 left-0 w-full overflow-hidden"
            >
              <svg width="100%" height={height} className="absolute top-0 left-0">
                <defs>
                  <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="50%" stopColor="#7000ff" />
                    <stop offset="100%" stopColor="#00f0ff" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path 
                  d={pathStr} 
                  fill="none" 
                  stroke="url(#roadGradient)" 
                  strokeWidth="4"
                  filter="url(#glow)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
        )}

        <div className="flex flex-col gap-16 md:gap-32 relative z-10">
          {events.map((event, idx) => (
            <TimelineItem 
              key={event.title}
              event={event}
              idx={idx}
              isEven={idx % 2 === 0}
              scaleY={scaleY}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

