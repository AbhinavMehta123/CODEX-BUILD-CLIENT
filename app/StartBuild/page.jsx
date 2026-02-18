"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { socket } from "@/utils/socket";

export default function StartBuild() {
  const [formData, setFormData] = useState({ name: "", domain: "" });
  const [domains, setDomains] = useState([]);
  const [topic, setTopic] = useState("");
  const [timeLeft, setTimeLeft] = useState(110 * 60);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [waitingForHost, setWaitingForHost] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [count, setCount] = useState(3);

  // ✅ Sample fallback data (used if backend is unavailable)
  const fallbackDomains = [
    { name: "AI", topics: ["Neural Network Visualizer", "Self-Correction Coding Agent", "Predictive Infrastructure Bot"] },
    { name: "Web3", topics: ["Decentralized Identity Vault", "Gasless NFT Marketplace", "DAO Governance Dashboard"] },
    { name: "Cybersecurity", topics: ["Zero-Trust Access Gateway", "Real-time Threat Map", "Encrypted Packet Sniffer"] },
    { name: "Fintech", topics: ["Automated Yield Aggregator", "Fractional Asset Protocol", "Real-time Fraud Detector"] },
    { name: "Cloud Native", topics: ["Edge Computing Orchestrator", "Serverless Event Mesh", "Multi-Cloud Load Balancer"] },
  ];

  // ✅ Fetch available domains and topics from backend
  useEffect(() => {
    axios
      .get("https://codex-build-backend.onrender.com/api/domains-with-topics")
      .then((res) => {
        if (res.data && res.data.length > 0) setDomains(res.data);
        else setDomains(fallbackDomains);
      })
      .catch(() => setDomains(fallbackDomains));
  }, []);

  // ✅ Verify participant session
  useEffect(() => {
    const token = localStorage.getItem("+t0N9wuQod3xw7YdHPbCJW5JzunVASltsSENOz9Ym6M=");
    if (token) {
      axios
        .post("https://codex-build-backend.onrender.com/api/participant/verify", { token })
        .then((res) => {
          const data = res.data;
          setFormData({ name: data.name, domain: data.domain });
          setTopic(data.topic);
          setStartTime(data.startTime);
          setWaitingForHost(true); // wait for admin start
        })
        .catch(() => localStorage.removeItem("+t0N9wuQod3xw7YdHPbCJW5JzunVASltsSENOz9Ym6M="));
    }
  }, []);

  // ✅ Handle Start Build
  const handleStart = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.domain) return;

    try {
      const res = await axios.post("https://codex-build-backend.onrender.com/api/participant/StartBuild", {
        name: formData.name,
        domain: formData.domain,
      });

      const data = res.data;
      setTopic(data.topic);
      setWaitingForHost(true); // 👈 Wait for host
      localStorage.setItem("+t0N9wuQod3xw7YdHPbCJW5JzunVASltsSENOz9Ym6M=", data.token);
    } catch (err) {
      console.error("Error starting build:", err);
      const selected = fallbackDomains.find((d) => d.name === formData.domain);
      if (selected) {
        const randomTopic = selected.topics[Math.floor(Math.random() * selected.topics.length)];
        setTopic(randomTopic);
        setWaitingForHost(true);
        setStartTime(new Date().toISOString());
      }
    }
  };

  // ✅ Timer logic synced with backend startTime
  useEffect(() => {
    if (!isActive || !startTime) return;
    const endTime = new Date(startTime).getTime() + 110 * 60 * 1000;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0) playAlarm();
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // ✅ Play alarm when time is up
  const playAlarm = () => {
    const audio = new Audio("/alarm.mp3");
    audio.play().catch((err) => console.log("Audio playback error:", err));
    if (!localStorage.getItem("alarmPlayed")) {
      alert("⏰ Time's up! 110 minutes completed.");
      localStorage.setItem("alarmPlayed", "true");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 🎞️ Animation Variants
  const containerVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVars = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  // ✅ Real-time admin control
  useEffect(() => {
    socket.on("hackathon_started", (startTimeFromAdmin) => {
      console.log("🔥 Hackathon starting soon!");
      setIsCountdown(true);
      setWaitingForHost(false);

      let counter = 3;
      const countdownInterval = setInterval(() => {
        setCount(counter);
        counter--;
        if (counter < 0) {
          clearInterval(countdownInterval);
          setIsCountdown(false);
          setStartTime(startTimeFromAdmin);
          setIsActive(true);
        }
      }, 1000);
    });

    socket.on("hackathon_stopped", () => {
      console.log("🛑 Hackathon stopped by admin");
      setIsActive(false);
    });

    socket.on("connect", () => console.log("🟢 Connected to socket:", socket.id));

    return () => {
      socket.off("hackathon_started");
      socket.off("hackathon_stopped");
      socket.off("connect");
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#02040a] text-cyan-400 font-mono p-6 flex flex-col items-center justify-center">
      
      {/* 🕒 Countdown Overlay */}
      {isCountdown && (
        <motion.div
          key="countdown"
          className="absolute inset-0 flex items-center justify-center bg-[#02040a] text-white text-8xl font-black z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {count > 0 ? (
            <motion.span
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]"
            >
              {count}
            </motion.span>
          ) : (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              className="text-4xl text-emerald-400 tracking-widest uppercase"
            >
              Timer Starting...
            </motion.span>
          )}
        </motion.div>
      )}

      {/* ⏳ Waiting for Host */}
      {waitingForHost && !isActive && !isCountdown && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center text-cyan-400 bg-[#02040a] z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-4xl font-black mb-4 animate-pulse">⏳ Waiting for host...</p>
          <p className="text-sm text-slate-400 uppercase tracking-[0.3em]">Timer will start soon</p>
        </motion.div>
      )}

      <div className="w-full max-w-2xl relative">
        <AnimatePresence mode="wait">
          {!isActive ? (
            /* 🧩 FORM */
            <motion.form
              key="setup-form"
              variants={containerVars}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              onSubmit={handleStart}
              className="bg-black/40 border border-cyan-500/20 p-10 rounded-xl backdrop-blur-3xl shadow-[0_0_50px_rgba(6,182,212,0.1)] space-y-10"
            >
              <motion.div variants={itemVars} className="text-center mb-4">
                <h2 className="text-[10px] tracking-[0.8em] text-cyan-500 uppercase font-bold">Initial_Entry_Protocol</h2>
              </motion.div>

              <motion.div variants={itemVars}>
                <label className="block text-[9px] uppercase tracking-widest mb-4 text-cyan-500/40 font-bold italic">01. Identity_Check</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="INPUT_FULL_NAME"
                  className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-all rounded-t-md placeholder:text-slate-800 text-lg"
                />
              </motion.div>

              <motion.div variants={itemVars}>
                <label className="block text-[9px] uppercase tracking-widest mb-4 text-cyan-500/40 font-bold italic">02. Select_Architecture_Type</label>
                <div className="relative group">
                  <select
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white appearance-none focus:outline-none focus:border-cyan-500 cursor-pointer transition-all text-lg"
                  >
                    <option value="" disabled className="bg-[#02040a]">
                      SELECT_DOMAIN
                    </option>
                    {domains.map((d) => (
                      <option key={d.name} value={d.name} className="bg-[#02040a] text-white italic uppercase">
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500 group-hover:animate-bounce">▼</div>
                </div>
              </motion.div>

              <motion.button
                variants={itemVars}
                whileHover={{ scale: 1.02, letterSpacing: "0.5em" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-cyan-500 py-6 text-black font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-white transition-all duration-500 cursor-pointer"
              >
                COMPILE & START
              </motion.button>
            </motion.form>
          ) : (
            /* 🚀 ACTIVE SESSION */
            <motion.div
              key="active-session"
              initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
              className="flex flex-col items-center"
            >
              <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="text-center mb-16">
                <div className="text-8xl md:text-[160px] font-black text-white drop-shadow-[0_0_40px_rgba(6,182,212,0.4)] tabular-nums leading-none">
                  {formatTime(timeLeft)}
                </div>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <span className="h-[1px] w-12 bg-emerald-500/50" />
                  <span className="text-[10px] text-emerald-500 tracking-[0.5em] animate-pulse font-bold">DEPLOYMENT_ACTIVE</span>
                  <span className="h-[1px] w-12 bg-emerald-500/50" />
                </div>
              </motion.div>

              <div className="w-full bg-white/5 border border-white/10 p-12 rounded-2xl backdrop-blur-md text-center">
                <p className="text-[10px] text-cyan-500/50 mb-2 uppercase tracking-widest italic">Target_Objective_Locked</p>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-white italic"
                >
                  "{topic}"
                </motion.h3>
                <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  <span>Arch: {formData.name}</span>
                  <span>Sector: {formData.domain}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
    </main>
  );
}
