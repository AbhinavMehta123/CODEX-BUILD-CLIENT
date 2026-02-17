"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function GlobalLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [activeLog, setActiveLog] = useState(0);

  const systemLogs = [
    "INITIALIZING_CORE_ENGINE",
    "DECRYPTING_NEURAL_STREAMS",
    "ESTABLISHING_VIRTUAL_DOMAINS",
    "SYNCING_ALFA_PROTOCOL",
    "BYPASSING_FIREWALLS",
    "LOADING_VISUAL_INTERFACE",
    "SYSTEM_READY"
  ];

  // Reset progress when the component mounts
  useEffect(() => {
    setProgress(0);
  }, []);

  useEffect(() => {
    let interval;

    interval = setInterval(() => {
      setProgress((prev) => {
        // Reset if offline and loader completes
        if (!navigator.onLine && prev >= 100) {
          return 0;
        }

        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setProgress(0);
            onComplete?.();
          }, 800);
          return 100;
        }

        const currentLogIndex = Math.min(
          Math.floor((prev / 100) * systemLogs.length),
          systemLogs.length - 1
        );
        setActiveLog(currentLogIndex);

        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete, systemLogs]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "circIn" }}
      className="fixed inset-0 z-[10000] bg-[#02040a] flex flex-col items-center justify-center font-mono overflow-hidden"
    >
      {/* 1. Removed Scanning Line */}

      {/* 2. Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(circle_at_center,black,transparent_90%)]" />

      <div className="relative z-10 flex flex-col items-center">
        {/* 3. Circular SVG Loader */}
        <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full"
          />
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray="502.4"
              animate={{ strokeDashoffset: 502.4 - (502.4 * progress) / 100 }}
              className="text-cyan-500 shadow-[0_0_15px_#06b6d4]"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white italic tracking-tighter tabular-nums">
              {progress}
            </span>
            <span className="text-cyan-500 text-xs font-bold tracking-[0.3em]">
              PCNT_
            </span>
          </div>
        </div>

        {/* 4. Real-time System Logs */}
        <div className="h-6 flex items-center justify-center mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLog}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-4"
            >
              <span className="w-2 h-2 bg-cyan-500 animate-pulse rounded-full shadow-[0_0_10px_#06b6d4]" />
              <p className="text-cyan-500/80 text-[10px] tracking-[0.4em] font-black uppercase italic">
                &gt; {systemLogs[activeLog]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 5. Status Details */}
        <div className="grid grid-cols-2 gap-20 border-t border-white/10 pt-6">
          <div className="text-left space-y-1">
            <p className="text-[8px] text-slate-700 tracking-widest uppercase">
              Node: Global_Dist
            </p>
            <p className="text-[8px] text-slate-700 tracking-widest uppercase">
              Auth: Alfa_Club
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[8px] text-slate-700 tracking-widest uppercase italic">
              0x{progress}F_CORE
            </p>
            <p className="text-[8px] text-slate-700 tracking-widest uppercase">
              Secure_Link: ON
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
