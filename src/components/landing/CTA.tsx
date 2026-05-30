import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-32 px-6 lg:px-24 relative overflow-hidden bg-[#050505]">
      {/* Dynamic Grid Background specific to CTA */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at 50% 50%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black, transparent 75%)",
        }}
      />

      {/* Futuristic soft gradient background orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-primary/10 to-neon-purple/5 rounded-[100%] blur-[130px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto relative z-10"
      >
        {/* Terminal Container */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/45 backdrop-blur-xl p-8 sm:p-12 md:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group hover:border-primary/30 transition-all duration-500">
          
          {/* Laser Scanning Line Sweep */}
          <div 
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 pointer-events-none z-20"
            style={{
              animation: "laserSweep 4s linear infinite",
            }}
          />
          <style>{`
            @keyframes laserSweep {
              0% { top: 0%; opacity: 0; }
              5% { opacity: 0.8; }
              95% { opacity: 0.8; }
              100% { top: 100%; opacity: 0; }
            }
          `}</style>

          {/* Corner Crosshairs (Cyber Tech Details) */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/20 pointer-events-none group-hover:border-primary/50 transition-colors duration-300" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/20 pointer-events-none group-hover:border-primary/50 transition-colors duration-300" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/20 pointer-events-none group-hover:border-primary/50 transition-colors duration-300" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/20 pointer-events-none group-hover:border-primary/50 transition-colors duration-300" />

          {/* Top Panel Status Info */}
          <div className="flex justify-between items-center text-[10px] font-mono text-text-500 tracking-[0.2em] mb-8 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span>SECURE_LINK: ESTABLISHED</span>
            </div>
            <div className="hidden sm:block">
              <span>LOC_ID: GWL_AMITY</span>
            </div>
            <div>
              <span>SYS_AUTH: REQUIRED</span>
            </div>
          </div>

          <div className="text-center">
            {/* Title with Cyber Glow and Gradient */}
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white"
            >
              Ready to Enter the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-purple drop-shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                Cyber Arena?
              </span>
            </motion.h2>

            <p className="mt-6 text-text-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
              Gather your elite team, scan the network perimeter, and exploit zero-day vulnerabilities in a simulated high-fidelity cyberpunk sandbox. The clock is ticking.
            </p>

            {/* Tactical Dashboard Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto mt-10 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left font-mono">
              <div>
                <div className="text-[10px] text-text-500 uppercase tracking-wider">Duration</div>
                <div className="text-base font-bold text-white mt-0.5">32 Hours Continuous</div>
              </div>
              <div>
                <div className="text-[10px] text-text-500 uppercase tracking-wider">Access</div>
                <div className="text-base font-bold text-primary mt-0.5">Invite / Open</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-[10px] text-text-500 uppercase tracking-wider">Target</div>
                <div className="text-base font-bold text-neon-purple mt-0.5">BugBounty / CTF</div>
              </div>
            </div>

            {/* Premium Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-5">
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-white text-black font-extrabold text-base tracking-wide hover:scale-105 transition-transform duration-300 shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_50px_rgba(0,240,255,0.5)] text-center relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-neon-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                Register Team
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-10 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-white font-bold text-base tracking-wide hover:bg-white/10 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)] transition-all duration-300 text-center"
              >
                Login Dashboard
              </Link>
            </div>
          </div>

          {/* Bottom Panel Status Info */}
          <div className="mt-12 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-[9px] font-mono text-text-500 tracking-wider">
            <div>STATUS: ONLINE</div>
            <div>VER: 2.1.0_PROD</div>
            <div className="hidden sm:block">ENCRYPTION: AES_256_GCM</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
