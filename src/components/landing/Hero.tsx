import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import ParticlesBackground from "./ParticlesBackground";

export default function Hero() {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityText = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section id="home" className="relative flex items-center justify-center min-h-screen py-20 overflow-hidden bg-[#050505]">

      {/* ── CSS-only animated background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(0,240,255,0.06) 0%, transparent 70%)",
            "radial-gradient(ellipse 60% 80% at 80% 30%, rgba(191,0,255,0.05) 0%, transparent 70%)",
            "radial-gradient(ellipse 70% 50% at 50% 80%, rgba(79,70,229,0.04) 0%, transparent 70%)",
          ].join(", "),
          animation: "heroPulse 12s ease-in-out infinite alternate",
        }}
      />
      <style>{`
        @keyframes heroPulse {
          0%   { opacity: .7; transform: scale(1); }
          50%  { opacity: 1;  transform: scale(1.05); }
          100% { opacity: .8; transform: scale(1.02); }
        }
        @keyframes gridShift {
          0%   { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
      `}</style>

      {/* Subtle animated grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 60px)",
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 60px)",
          ].join(", "),
          animation: "gridShift 30s linear infinite",
        }}
      />

      {/* Network Particles */}
      <ParticlesBackground />

      {/* Floating gradient orbs via framer-motion */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full pointer-events-none mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(0,240,255,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
          top: "5%",
          left: "5%",
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute w-[35vw] h-[35vw] rounded-full pointer-events-none mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(191,0,255,0.10) 0%, transparent 70%)",
          filter: "blur(100px)",
          bottom: "10%",
          right: "5%",
        }}
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute w-[25vw] h-[25vw] rounded-full pointer-events-none mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)",
          filter: "blur(90px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{ x: [0, 30, -30, 0], y: [0, -40, 10, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <div className="center-max px-6 lg:px-24 relative z-10 w-full mt-24">
        <motion.div style={{ y: yText, opacity: opacityText }} className="max-w-5xl mx-auto text-center flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-bold tracking-[0.2em] uppercase text-text-500 shadow-2xl"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Amity University Gwalior — 21 August 2026
          </motion.div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black leading-[0.9] tracking-tighter text-white select-none">
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="block mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
            >
              32HR BUGBOUNTY
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-gradient block pb-4"
            >
              HACKATHON
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-text-500 max-w-2xl text-center font-normal leading-relaxed tracking-wide px-4"
          >
            Build. Secure. Innovate. Deploy your skills in a high-stakes 32-hour arena simulating real-world zero-day vulnerabilities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-white text-black font-extrabold text-lg tracking-wide hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Register Team
            </Link>
            <a
              href="#about"
              className="w-full sm:w-auto px-10 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-white font-semibold text-lg tracking-wide hover:bg-white/10 transition-colors duration-300"
            >
              Explore Console
            </a>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
