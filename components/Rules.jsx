"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function RulesSection() {
  // ✅ keep your static fallback for instant render
  const fallbackData = {
    sectionNumber: "03",
    title: "Codex",
    titleAccent: "Rules_",
    cards: [
      { 
        id: "01", 
        title: "Stack Integrity", 
        desc: "Participants must use the approved tech stack. No external frameworks permitted.",
        tag: "STRICT" 
      },
      { 
        id: "02", 
        title: "Temporal Bound", 
        desc: "The 110-minute clock is absolute. Late submissions trigger auto-rejection.",
        tag: "HARD_STOP" 
      },
      { 
        id: "03", 
        title: "Neural Flow", 
        desc: "AI is for optimization only. Core logic architecture must be human-authored.",
        tag: "VERIFIED" 
      },
      { 
        id: "04", 
        title: "Dependencies", 
        desc: "All packages must be declared. Hidden scripts lead to disqualification.",
        tag: "WHITELIST" 
      },
    ],
  };

  // ✅ start with fallback, then update from backend
  const [rulesData, setRulesData] = useState(fallbackData);

  // ✅ Fetch data from your live backend API
  useEffect(() => {
    axios
      .get("https://codex-build-backend.onrender.com/api/rules")
      .then((res) => {
        // handle both array or single object response safely
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRulesData(res.data[0]); // if backend returns an array
        } else if (res.data) {
          setRulesData(res.data); // if backend returns a single object
        }
      })
      .catch((err) => console.error("Error fetching Rules data:", err));
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section id="rules" className="relative py-32 bg-[#02040a] text-white font-mono">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <h2 className="text-cyan-500 text-xs tracking-[0.5em] font-bold uppercase">
              Section_{rulesData.sectionNumber} // Build_Rules
            </h2>
          </div>
          <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
            {rulesData.title} <span className="text-cyan-500">{rulesData.titleAccent}</span>
          </h3>
        </motion.div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rulesData.cards.map((rule, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative p-8 border border-white/10 bg-white/5 backdrop-blur-md group hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] text-cyan-500 border border-cyan-500/30 px-2 py-1 uppercase tracking-widest font-bold">
                  {rule.tag}
                </span>
                <span className="text-slate-700 font-bold italic group-hover:text-cyan-500/50 transition-colors">
                  // {rule.id}
                </span>
              </div>

              <h4 className="text-xl font-black mb-3 tracking-tight group-hover:translate-x-1 transition-transform uppercase italic">
                {rule.title}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {rule.desc}
              </p>

              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/10 group-hover:border-cyan-500 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
