import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  { q: "What is the maximum team size?", a: "Teams can have up to 4 members. You can also participate solo if you prefer." },
  { q: "Is overnight stay allowed?", a: "Yes, limited arrangements will be provided for late-night hacking sessions at the campus." },
  { q: "What is the difficulty level of the challenges?", a: "The infrastructure is designed to emulate real-world enterprise networks. Expect challenging, undocumented vulnerabilities." },
  { q: "Are we allowed to use the internet?", a: "Yes, full internet access is permitted. You can use any tooling or scripts you have available." },
  { q: "How does the submission process work?", a: "When you discover a flag or vulnerability, submit a proof-of-concept (PoC) report via the Console. Points are awarded based on impact." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div id="faq" className="center-max relative z-10 w-full pt-32 pb-32 px-6">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight mb-4">
          Common <span className="text-gradient">Inquiries</span>
        </h2>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((f, idx) => {
          const isOpen = openIndex === idx;
          return (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-2xl border transition-all duration-300 ${isOpen ? 'border-primary/50 bg-white/[0.04]' : 'border-white/10 bg-white/[0.01] hover:bg-white/[0.02]'}`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
              >
                <span className={`font-display font-bold text-lg transition-colors ${isOpen ? 'text-white' : 'text-text-900'}`}>
                  {f.q}
                </span>
                <span className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-500'}`}>
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-text-500 leading-relaxed border-t border-white/5 mt-2">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
