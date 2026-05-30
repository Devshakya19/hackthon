import React from "react";
import { motion } from "framer-motion";

const sponsors = [
  { name: "Google Security", color: "from-blue-500 to-green-500" },
  { name: "Offensive Security", color: "from-gray-700 to-gray-900" },
  { name: "HackerOne", color: "from-gray-100 to-white" },
  { name: "Bugcrowd", color: "from-orange-500 to-red-500" },
  { name: "CrowdStrike", color: "from-red-600 to-red-800" },
  { name: "Amity IT Dept", color: "from-yellow-400 to-yellow-600" },
];

export default function Sponsors() {
  return (
    <div id="sponsors" className="w-full py-24 overflow-hidden relative">
      {/* Edge Gradients for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10" />

      <div className="text-center mb-12">
        <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-text-500">Supported by Industry Leaders</h3>
      </div>

      <div className="flex w-[200%] animate-marquee hover:[animation-play-state:paused]">
        {/* We map twice to create the seamless infinite loop */}
        {[...sponsors, ...sponsors].map((s, i) => (
          <div 
            key={i} 
            className="flex-1 flex justify-center items-center px-12 group cursor-pointer"
          >
            <div className={`text-2xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br ${s.color} opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500`}>
              {s.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
