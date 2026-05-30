import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";

const links = [
  { name: "Home", id: "home" },
  { name: "Timeline", id: "timeline" },
  { name: "Tracks", id: "tracks" },
  { name: "Sponsors", id: "sponsors" },
  { name: "FAQ", id: "faq" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }
    
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -50% 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    links.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  function handleLinkClick(id: string) {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  }

  return (
    <header className="fixed w-full z-50 top-0 left-0 right-0 px-4 sm:px-6 lg:px-12 transition-all duration-300">
      <nav
        className={`mx-auto flex items-center justify-between transition-all duration-500 border ${
          scrolled
            ? "max-w-4xl mt-3 px-6 py-2.5 rounded-full bg-black/65 border-primary/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,240,255,0.15)]"
            : "max-w-7xl mt-5 px-8 py-4 rounded-2xl bg-white/[0.02] border-white/5 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.2)]"
        }`}
      >
        {/* Logo Section */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleLinkClick("home")}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-bg font-extrabold text-lg relative overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            {/* Spinning scanner shine inside logo */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-[200%]"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />
            <span className="relative z-10 text-black">32</span>
          </motion.div>
          <div>
            <div className="text-sm font-black text-white tracking-wide flex items-center gap-1">
              <span>32HR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="text-[10px] text-primary uppercase tracking-[0.2em] -mt-0.5 font-bold">
              BugBounty
            </div>
          </div>
        </div>

        {/* Desktop Links with Sliding Pill Indicator */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((l, index) => {
            const isHovered = hoveredIndex === index;
            const isActive = activeSection === l.id;
            return (
              <button
                key={l.id}
                onClick={() => handleLinkClick(l.id)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative px-4 py-2 text-sm font-semibold transition-colors duration-300 rounded-full"
                style={{
                  color: isActive ? "#00f0ff" : isHovered ? "#ffffff" : "#9ca3af",
                }}
              >
                {/* Hover capsule background */}
                {isHovered && (
                  <motion.span
                    layoutId="navHover"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-full -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                {/* Active Indicator Underline */}
                {isActive && (
                  <motion.span
                    layoutId="navActive"
                    className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-primary to-neon-purple rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                {l.name}
              </button>
            );
          })}
        </div>

        {/* Buttons / Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden sm:inline-flex px-5 py-2 text-sm rounded-full border border-white/10 text-white font-semibold hover:border-primary hover:text-primary transition-all duration-300 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            Login
          </Link>
          <Link
            to="/register"
            className="hidden sm:inline-flex px-5 py-2.5 text-sm rounded-full bg-gradient-to-r from-primary to-neon-purple text-bg font-extrabold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all transform hover:scale-105 duration-300 text-black"
          >
            Register
          </Link>

          <button
            aria-label="menu"
            onClick={() => setOpen(true)}
            className="md:hidden p-2.5 rounded-full bg-white/5 text-white border border-white/10 hover:border-primary/50 transition-colors"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex"
          >
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setOpen(false)} />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative ml-auto w-72 bg-[#050505] border-l border-white/10 p-6 flex flex-col h-full shadow-2xl z-10"
            >
              {/* Futuristic grids inside side menu */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="font-extrabold text-white text-lg tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  NAVIGATION
                </div>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 text-white border border-white/10 flex items-center justify-center hover:border-primary/50 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                {links.map((l, index) => {
                  const isActive = activeSection === l.id;
                  return (
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={l.id}
                      onClick={() => handleLinkClick(l.id)}
                      className={`text-left py-3 px-4 rounded-xl font-bold text-base transition-all flex items-center justify-between ${
                        isActive
                          ? "text-primary bg-primary/5 border border-primary/20"
                          : "text-text-500 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <span>{l.name}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </motion.button>
                  );
                })}

                <div className="mt-12 flex flex-col gap-3 relative z-10">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 text-white font-bold text-center hover:bg-white/5 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-neon-purple text-bg font-extrabold text-center shadow-[0_0_15px_rgba(0,240,255,0.3)] text-black"
                  >
                    Register Team
                  </Link>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
