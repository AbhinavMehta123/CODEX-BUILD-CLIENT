"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { socket } from "@/utils/socket";

export default function StartBuild() {
  const [formData, setFormData] = useState({ name: "", phone: "", college: "", course: "" });
  const [topic, setTopic] = useState("");
  const [timeLeft, setTimeLeft] = useState(110 * 60);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [waitingForHost, setWaitingForHost] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [count, setCount] = useState(3);

  // ✅ Restore participant and timer state from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("participantData");
    const savedStartTime = localStorage.getItem("startTime");
    const savedIsActive = localStorage.getItem("isActive");

    if (savedData) setFormData(JSON.parse(savedData));
    if (savedStartTime) setStartTime(savedStartTime);
    if (savedIsActive === "true") setIsActive(true);

    // Verify participant session
    const token = localStorage.getItem("+t0N9wuQod3xw7YdHPbCJW5JzunVASltsSENOz9Ym6M=");
    if (token && !savedData) {
      axios
        .post("https://codex-build-backend.onrender.com/api/participant/verify", { token })
        .then((res) => {
          const data = res.data;
          setFormData({
            name: data.name,
            phone: data.phone,
            college: data.college,
            course: data.course,
          });
          if (data.topic) setTopic(data.topic);
          if (data.startTime) {
            setStartTime(data.startTime);
            localStorage.setItem("startTime", data.startTime);
          }
          setWaitingForHost(true);
          localStorage.setItem("participantData", JSON.stringify(data));
        })
        .catch(() => localStorage.removeItem("+t0N9wuQod3xw7YdHPbCJW5JzunVASltsSENOz9Ym6M="));
    }

    // 🕒 Fetch current hackathon status from backend
    axios
      .get("https://codex-build-backend.onrender.com/api/hackathon/status")
      .then((res) => {
        const payload = res.data || {};
        if (payload.isActive) {
          setIsActive(true);
          if (payload.startTime) {
            setStartTime(payload.startTime);
            localStorage.setItem("startTime", payload.startTime);
          }
          if (payload.topic) {
            setTopic(payload.topic);
            localStorage.setItem("topic", payload.topic);
          }
          localStorage.setItem("isActive", "true");
          setWaitingForHost(false);
        } else {
          setIsActive(false);
          setWaitingForHost(true);
          localStorage.setItem("isActive", "false");
        }
      })
      .catch((err) => console.error("Error fetching hackathon status:", err));
  }, []);

  // ✅ Restore topic from localStorage on refresh
  useEffect(() => {
    const savedTopic = localStorage.getItem("topic");
    if (savedTopic) setTopic(savedTopic);
  }, []);

  // ✅ Save participant data locally
  useEffect(() => {
    if (formData.name) localStorage.setItem("participantData", JSON.stringify(formData));
  }, [formData]);

  // ✅ Save timer state
  useEffect(() => {
    if (startTime) localStorage.setItem("startTime", startTime);
    localStorage.setItem("isActive", isActive.toString());
  }, [startTime, isActive]);

  // ✅ Persist topic to localStorage
  useEffect(() => {
    if (topic) localStorage.setItem("topic", topic);
  }, [topic]);

  // ✅ Handle Start Build
  const handleStart = async (e) => {
    e.preventDefault();
    const { name, phone, college, course } = formData;
    if (!name || !phone || !college || !course) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const res = await axios.post("https://codex-build-backend.onrender.com/api/StartBuild", {
        name,
        phone,
        college,
        course,
      });

      const data = res.data;
      if (data.topic) {
        setTopic(data.topic);
        localStorage.setItem("topic", data.topic);
      }
      setWaitingForHost(true);
      if (data.token) {
        localStorage.setItem("+t0N9wuQod3xw7YdHPbCJW5JzunVASltsSENOz9Ym6M=", data.token);
      }
      localStorage.setItem("participantData", JSON.stringify(formData));
    } catch (err) {
      console.error("Error starting build:", err);
      alert("Backend not reachable. Please try again later.");
    }
  };

  // ✅ Timer logic synced with backend startTime
  useEffect(() => {
    if (!startTime || !isActive) {
      if (!isActive) setTimeLeft(0);
      return;
    }

    const endTime = new Date(startTime).getTime() + 110 * 60 * 1000;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        playAlarm();
        setIsActive(false);
        setStartTime(null);
        localStorage.removeItem("startTime");
        localStorage.setItem("isActive", "false");
        setWaitingForHost(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, isActive]);

  const playAlarm = () => {
    const audio = new Audio("/alarm.mp3");
    audio.play().catch((err) => console.log("Audio playback error:", err));
    if (!localStorage.getItem("alarmPlayed")) {
      alert("⏰ Time's up! 110 minutes completed.");
      localStorage.setItem("alarmPlayed", "true");
    }
  };

  // ✅ Format timer to HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ✅ Real-time admin control (socket)
 // ✅ Socket Events (admin control)
useEffect(() => {
  socket.on("hackathon_started", (payload) => {
    console.log("🔥 Hackathon starting soon!");
    setIsCountdown(true);
    setWaitingForHost(false);

    // Parse payload
    let backendStart = null;
    let backendTopic = null;
    if (typeof payload === "string") backendStart = payload;
    else if (typeof payload === "object") {
      backendStart = payload.startTime || null;
      backendTopic = payload.topic || null;
    }

    // Save topic
    if (backendTopic) {
      setTopic(backendTopic);
      localStorage.setItem("topic", backendTopic);
    }

    // Countdown animation (3...2...1...Go!)
    let counter = 3;
    setCount(counter);

    const countdownInterval = setInterval(() => {
      counter--;
      if (counter >= 0) setCount(counter);
      else {
        clearInterval(countdownInterval);
        setIsCountdown(false);

        // ✅ Offset backend time by countdown duration (3s)
        const countdownDuration = 3000;
        const effectiveStart = backendStart
          ? new Date(new Date(backendStart).getTime() + countdownDuration).toISOString()
          : new Date(Date.now() + countdownDuration).toISOString();

        // Activate timer
        setStartTime(effectiveStart);
        setIsActive(true);
        localStorage.setItem("startTime", effectiveStart);
        localStorage.setItem("isActive", "true");
      }
    }, 1000);
  });

  socket.on("hackathon_stopped", () => {
    console.log("🛑 Hackathon stopped by admin");
    setIsActive(false);
    setStartTime(null);
    setWaitingForHost(false);
    setTimeLeft(0);
    localStorage.removeItem("startTime");
    localStorage.removeItem("topic");
    localStorage.setItem("isActive", "false");
  });

  return () => {
    socket.off("hackathon_started");
    socket.off("hackathon_stopped");
  };
}, []);
  // 🎞️ Animation Variants
  const containerVars = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVars = { hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } };

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
              className="text-4xl md:text-3xl text-emerald-400 tracking-widest uppercase"
            >
              Timer Starting...
            </motion.span>
          )}
        </motion.div>
      )}

      {/* ⏳ Waiting for Host with Rules */}
      {waitingForHost && !isActive && !isCountdown && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center text-cyan-400 bg-[#02040a] z-50 p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-4xl font-black mb-4 animate-pulse">Waiting Room</p>
          <p className="text-sm text-slate-400 uppercase tracking-[0.3em] mb-8">
            Timer will be started by the host
          </p>

          <div className="max-w-md text-left text-slate-400 space-y-2 border border-cyan-500/20 rounded-xl p-6 bg-black/30 backdrop-blur-md">
            <h3 className="text-cyan-300 text-sm uppercase tracking-widest mb-3">Rules & Guidelines:</h3>
            <ul className="list-disc list-inside text-xs leading-relaxed">
              <li>Do not refresh or close the page after joining.</li>
              <li>Wait until the host starts the timer.</li>
              <li>You will have 110 minutes once the timer begins.</li>
              <li>Submit your project only after the timer ends.</li>
              <li>Maintain discipline and follow your mentor’s instructions.</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* 🎯 Main UI */}
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
              className="bg-black/40 border border-cyan-500/20 p-10 rounded-xl backdrop-blur-3xl shadow-[0_0_50px_rgba(6,182,212,0.1)] space-y-10 overflow-hidden"
            >
              <motion.div variants={itemVars} className="text-center mb-4">
                <h2 className="text-[10px] tracking-[0.8em] text-cyan-500 uppercase font-bold">
                  Initial_Entry_Protocol
                </h2>
              </motion.div>

              {["name", "phone", "college", "course"].map((field, i) => (
                <motion.div variants={itemVars} key={field}>
                  <label className="block text-[9px] uppercase tracking-widest mb-4 text-cyan-500/40 font-bold italic">
                    {`0${i + 1}. ${
                      field === "name"
                        ? "Identity_Check"
                        : field === "phone"
                        ? "Contact_Number"
                        : field === "college"
                        ? "Institution_Name"
                        : "Course_Name"
                    }`}
                  </label>
                  <input
                    type={field === "phone" ? "tel" : "text"}
                    required
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    placeholder={`INPUT_${field.toUpperCase()}`}
                    className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-all rounded-t-md placeholder:text-slate-800 text-lg"
                  />
                </motion.div>
              ))}

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
                <div className="text-8xl md:text-[120px] font-black text-white drop-shadow-[0_0_40px_rgba(6,182,212,0.4)] tabular-nums leading-none">
                  {formatTime(timeLeft)}
                </div>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <span className="h-[1px] w-12 bg-emerald-500/50" />
                  <span className="text-[10px] text-emerald-500 tracking-[0.5em] animate-pulse font-bold">
                    DEPLOYMENT_ACTIVE
                  </span>
                  <span className="h-[1px] w-12 bg-emerald-500/50" />
                </div>
              </motion.div>

              <div className="w-full bg-white/5 border border-white/10 p-12 rounded-2xl backdrop-blur-md text-center">
                <p className="text-[10px] text-cyan-500/50 mb-2 uppercase tracking-widest italic">
                  Target_Objective_Locked
                </p>
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
                  <span>Sector: {formData.college}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
            {/* 🎉 Thank You Screen After Timer Ends */}
      {!isActive && !waitingForHost && !isCountdown && timeLeft === 0 && (
        <motion.div
          key="thank-you"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#02040a] text-center text-cyan-400 z-50 p-10"
        >
          <h1 className="text-5xl font-black text-emerald-400 mb-6 drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]">
            Thank You for Participating!
          </h1>
          <p className="text-slate-400 mb-10 text-sm uppercase tracking-[0.2em]">
            You’ve completed your 110-minute build session.
          </p>
          <a
            href="/WorkSubmit"
            className="bg-emerald-400 text-black font-bold px-8 py-4 rounded-xl tracking-[0.2em] hover:bg-white transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
          >
            Submit Your Work
          </a>
        </motion.div>
      )}
    </main>
  );
}