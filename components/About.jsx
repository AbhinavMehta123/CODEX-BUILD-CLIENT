"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function AboutSection() {
  // ✅ Local state
  const [aboutData, setAboutData] = useState(null);

  // ✅ Fallback (instant load before API fetch)
  const fallbackData = {
    sectionNumber: "02",
    title: "ABOUT",
    titleAccent: "CODEX_",
    description: [
      "CODEX is not a standard hackathon. It is a high-pressure neural-sprint designed for architects who think in logic and build in fire.",
      "We strip away the noise. No fluff. No long intros. Just a 110-minute countdown, a randomized high-tier project domain, and your raw engineering talent."
    ],
    stats: [
      { label: "Execution Time", value: "110 MIN" },
      { label: "Complexity", value: "Level 09" },
      { label: "Protocols", value: "Neural/Web3" },
      { label: "Status", value: "Active" },
    ],
    logs: [
      { time: "0.00", text: "Init build environment..." },
      { time: "0.02", text: "Loading random_topic_generator..." },
      { time: "0.05", text: "Logic gates active." },
      { time: "READY", text: "Awaiting participant identity.", highlight: true },
    ],
    rules: [
      "Identity verification.",
      "Randomized domain assignment.",
      "110-minute rapid development.",
      "Prototype submission or termination."
    ]
  };

  // ✅ Fetch data from your live backend API
  useEffect(() => {
    axios
      .get("https://codex-build-backend.onrender.com/api/about")
      .then((res) => {
        // handle both array and object responses
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAboutData(res.data[0]); // if backend returns array
        } else if (res.data) {
          setAboutData(res.data); // if backend returns single object
        }
      })
      .catch((err) => {
        console.error("Error fetching About data:", err);
      });
  }, []);

  // ✅ Use API data if available, fallback otherwise
  const data = aboutData || fallbackData;

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // ✅ Everything below stays identical
  return (
    <section id="about" className="relative py-32 bg-[#02040a] text-white font-mono overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* HEADER AREA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <h2 className="text-cyan-500 text-xs tracking-[0.5em] font-bold uppercase">
              Section_{data.sectionNumber} // Project_Identity
            </h2>
          </div>
          <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter">
            {data.title} <span className="text-cyan-500">{data.titleAccent}</span>
          </h3>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* LEFT COLUMN */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className="space-y-6 text-slate-400 text-lg leading-relaxed max-w-xl">
              {data.description.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12">
              {data.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-4 border border-white/5 bg-white/5 backdrop-blur-sm group hover:border-cyan-500/50 transition-colors"
                >
                  <p className="text-[10px] text-cyan-500/50 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black tracking-tighter group-hover:text-cyan-400 transition-colors">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative border border-cyan-500/20 rounded-2xl overflow-hidden p-7 bg-black/40 shadow-2xl max-h-[580px]">
              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-cyan-500 font-bold mb-5 tracking-tighter text-sm sm:text-base">
                    &gt; SYSTEM_MANIFEST.LOG
                  </h4>
                  <ul className="space-y-3 text-[12px] text-slate-500 overflow-y-auto max-h-[320px] pr-2">
                    {data.logs.map((log, idx) => (
                      <li key={idx} className="flex gap-4">
                        <span
                          className={
                            log.highlight
                              ? "text-cyan-400 font-bold animate-pulse"
                              : "text-cyan-500/50"
                          }
                        >
                          [{log.time}]
                        </span>
                        {log.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-lg backdrop-blur-md mt-6">
                  <h5 className="text-white font-black text-sm sm:text-base uppercase mb-3 tracking-[0.18em]">
                    The Protocol
                  </h5>
                  <div className="space-y-2.5">
                    {data.rules.map((rule, idx) => (
                      <p
                        key={idx}
                        className="text-[12px] text-slate-400 leading-snug italic"
                      >
                        {idx + 1}. {rule}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
