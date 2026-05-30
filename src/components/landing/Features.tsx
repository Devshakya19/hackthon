import React from "react";
import { motion } from "framer-motion";
import { Shield, Globe, Smartphone, Key, Cpu, Zap } from "lucide-react";

const domains = [
  {
    title: "Web Security",
    desc: "Uncover OWASP Top 10 vulnerabilities in modern web applications. Exploit XSS, CSRF, and SQLi in sandboxed environments.",
    icon: Globe,
    colSpan: "col-span-1 md:col-span-2",
    delay: 0.1,
  },
  {
    title: "App Security",
    desc: "Reverse engineer Android/iOS binaries, bypass root detection, and intercept API calls.",
    icon: Smartphone,
    colSpan: "col-span-1",
    delay: 0.2,
  },
  {
    title: "Network Pentesting",
    desc: "Pivot through subnets, exploit legacy protocols, and gain domain admin in a massive simulated corporate network.",
    icon: Cpu,
    colSpan: "col-span-1",
    delay: 0.3,
  },
  {
    title: "Cryptography",
    desc: "Break custom encryption schemes, find hash collisions, and decipher intercepted transmissions.",
    icon: Key,
    colSpan: "col-span-1 md:col-span-2",
    delay: 0.4,
  },
];

export default function Features() {
  return (
    <div id="tracks" className="center-max relative z-10 w-full pt-32 pb-20">
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center justify-center gap-2 mb-4"
        >
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Threat Landscape</span>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight"
        >
          Explore Our <span className="text-gradient">Domains</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {domains.map((d, i) => (
          <motion.div
            key={d.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: d.delay, ease: "easeOut" }}
            className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors p-8 ${d.colSpan}`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors pointer-events-none" />
            
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white group-hover:text-primary transition-colors group-hover:scale-110 duration-300">
              <d.icon className="w-7 h-7" />
            </div>
            
            <h3 className="text-2xl font-display font-bold text-white mb-4">{d.title}</h3>
            <p className="text-text-500 text-sm leading-relaxed max-w-md group-hover:text-text-400 transition-colors">
              {d.desc}
            </p>
            
            {/* Subtle corner accent */}
            <div className="absolute bottom-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Zap className="w-5 h-5 text-primary/50" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
