import React from "react";
import { motion } from "framer-motion";

const tracks = [
  {
    title: "Artificial Intelligence",
    desc: "AI-driven vulnerability analysis and ML-assisted security.",
    icon: "🤖",
  },
  {
    title: "FinTech Innovation",
    desc: "Secure financial systems and transaction integrity challenges.",
    icon: "💳",
  },
  {
    title: "Sustainability Solutions",
    desc: "Green computing and sustainable security practices.",
    icon: "🌿",
  },
];

export default function Features() {
  return (
    <div id="tracks" className="max-w-6xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h3 className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">
          Themes & Tracks
        </h3>
        <h2 className="text-4xl md:text-5xl font-bold text-text-900 drop-shadow-md">
          Explore Our Domains
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tracks.map((t, idx) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="glass-card group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,240,255,0.1)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.3)]">
                {t.icon}
              </div>
              <h4 className="font-bold text-xl mb-3 text-white group-hover:text-primary transition-colors">
                {t.title}
              </h4>
              <p className="text-text-500 text-sm leading-relaxed">{t.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
