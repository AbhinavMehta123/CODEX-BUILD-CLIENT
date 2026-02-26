"use client";
import React, { useEffect, useState, useRef } from "react";
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
  const [hasFinished, setHasFinished] = useState(false);
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [statusChecked, setStatusChecked] = useState(false);

  const TOKEN_KEY = "+t0N9wuQod3xw7YdHPbCJW5JzunVASltsSENOz9Ym6M=";
  const hasLoadedOnce = useRef(false);

  // ✅ Preserve both token and activeSession
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const activeSession = localStorage.getItem("activeSession");
    localStorage.clear();
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (activeSession) localStorage.setItem("activeSession", activeSession);
  }, []);

  // ✅ Restore saved session first
  useEffect(() => {
    const savedSession = localStorage.getItem("activeSession");
    if (savedSession) {
      const { startTime, topic, name, isActive } = JSON.parse(savedSession);
      if (topic) setTopic(topic);
      if (name) setFormData((prev) => ({ ...prev, name }));

      if (isActive && startTime) {
        setStartTime(startTime);
        setIsActive(true);
        setWaitingForHost(false);
        setHasFinished(false);
        setLoading(false);
        setStatusChecked(true);
        return;
      }
    }

    // ✅ Verify participant and backend status
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      Promise.all([
        axios.post("https://codex-build-backend.onrender.com/api/participant/verify", { token }),
        axios.get("https://codex-build-backend.onrender.com/api/hackathon/status"),
      ])
        .then(([verifyRes, statusRes]) => {
          const data = verifyRes.data || {};
          const status = statusRes.data || {};

          if (!data.name) throw new Error("Invalid or expired participant");

          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            college: data.college || "",
            course: data.course || "",
          });

          if (data.topic) setTopic(data.topic);

          if (status.isActive && status.startTime) {
            setStartTime(status.startTime);
            setIsActive(true);
            setWaitingForHost(false);
          } else {
            setIsActive(false);
            setStartTime(null);
            setWaitingForHost(true);
          }
        })
        .catch(() => {
          setFormData({ name: "", phone: "", college: "", course: "" });
          setIsActive(false);
          setStartTime(null);
          setWaitingForHost(false);
          setHasFinished(false);
        })
        .finally(() => {
          setStatusChecked(true);
          setLoading(false);
        });
    } else {
      setStatusChecked(true);
      setLoading(false);
    }
  }, []);

  // ✅ Keep topic + name + timer saved in localStorage
  useEffect(() => {
    if (isActive && startTime) {
      const existing = JSON.parse(localStorage.getItem("activeSession") || "{}");
      localStorage.setItem(
        "activeSession",
        JSON.stringify({
          ...existing,
          startTime,
          topic,
          name: formData.name,
          isActive,
        })
      );
    }
  }, [isActive, startTime, topic, formData.name]);

  // ✅ Handle Start Build form
  const handleStart = async (e) => {
    e.preventDefault();
    const { name, phone, college, course } = formData;
    if (!name || !phone || !college || !course) {
      alert("Please fill in all required fields.");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
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
      if (data.topic) setTopic(data.topic);
      setWaitingForHost(true);

      if (data.token) localStorage.setItem(TOKEN_KEY, data.token);

      // ✅ Save participant info locally
      localStorage.setItem(
        "participantData",
        JSON.stringify({
          formData,
          topic: data.topic || "",
          sector: data.sector || "" ,
          token: data.token || "",
        })
      );
    } catch (err) {
      console.error("Error starting build:", err);
      alert("Backend not reachable. Please try again later.");
    }
  };

  // ✅ Timer logic
  useEffect(() => {
    if (!startTime || !isActive || hasFinished || waitingForHost) return;

    const endTime = new Date(startTime).getTime() + 110 * 60 * 1000;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        playAlarm();
        setIsActive(false);
        setHasFinished(true);
        setStartTime(null);
        setWaitingForHost(false);
        localStorage.removeItem("activeSession"); // ✅ Clear saved timer session
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, isActive, hasFinished, waitingForHost]);

  // 🧠 Compute time instantly after reload
  useEffect(() => {
    if (isActive && startTime) {
      const endTime = new Date(startTime).getTime() + 110 * 60 * 1000;
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(diff);
    }
  }, [isActive, startTime]);

  const playAlarm = () => {
    localStorage.removeItem("activeSession");
    const audio = new Audio("/alarm.mp3");
    audio.play().catch((err) => console.log("Audio playback error:", err));
    alert("⏰ Time's up! 110 minutes completed.");
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ✅ Socket Events
  useEffect(() => {
    socket.on("hackathon_started", (payload) => {
      if (hasLoadedOnce.current) return;
      hasLoadedOnce.current = true;

      setIsCountdown(true);
      setWaitingForHost(false);

      let backendStart = null;
      let backendTopic = null;
      if (typeof payload === "string") backendStart = payload;
      else if (typeof payload === "object") {
        backendStart = payload.startTime || null;
        backendTopic = payload.topic || null;
      }

      if (backendTopic) setTopic(backendTopic);

      let counter = 3;
      setCount(counter);

      const countdownInterval = setInterval(() => {
        counter--;
        if (counter >= 0) setCount(counter);
        else {
          clearInterval(countdownInterval);
          setIsCountdown(false);
          const countdownDuration = 3000;
          const effectiveStart = backendStart
            ? new Date(new Date(backendStart).getTime() + countdownDuration).toISOString()
            : new Date(Date.now() + countdownDuration).toISOString();

          setStartTime(effectiveStart);
          setIsActive(true);
          setHasFinished(false);

          // ✅ Save full session (topic + name + timer)
          localStorage.setItem(
            "activeSession",
            JSON.stringify({
              startTime: effectiveStart,
              topic: backendTopic || topic,
              name: formData.name || "",
              isActive: true,
            })
          );
        }
      }, 1000);
    });

    socket.on("hackathon_stopped", () => {
      localStorage.removeItem("activeSession");
      hasLoadedOnce.current = false;
      setIsActive(false);
      setStartTime(null);
      setTopic("");
      setHasFinished(false);
      setIsCountdown(false);
      setWaitingForHost(true);
    });

    return () => {
      socket.off("hackathon_started");
      socket.off("hackathon_stopped");
    };
  }, []);

  // ✅ Check hackathon status via socket
  useEffect(() => {
    socket.emit("check_hackathon_status");

    socket.on("hackathon_status", (status) => {
      if (status?.isActive) {
        hasLoadedOnce.current = true;
        setIsActive(true);
        setWaitingForHost(false);
        setStartTime(status.startTime);
        setHasFinished(false);
      } else {
        hasLoadedOnce.current = false;
        setIsActive(false);
        setStartTime(null);
        setWaitingForHost(true);
      }
    });

    return () => socket.off("hackathon_status");
  }, []);

  // ✅ Clear session after finishing
  useEffect(() => {
    if (hasFinished) {
      localStorage.removeItem("activeSession");
      localStorage.removeItem("participantData");
    }
  }, [hasFinished]);

  const containerVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVars = { hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } };

  // ✅ Loader
  if (loading || !statusChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#02040a] text-cyan-400 font-mono">
        <p className="animate-pulse text-xl">Verifying participant...</p>
      </main>
    );
  }

  // 🧱 UI below unchanged
  return (
    <main className="min-h-screen bg-[#02040a] text-cyan-400 font-mono p-6 flex flex-col items-center justify-center relative">
      {hasFinished && (
        <motion.div
          key="thank-you"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#02040a] text-center text-cyan-400 z-[60] p-10"
        >
          <h1 className="text-5xl font-black text-emerald-400 mb-6 drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]">
            Thank You for Participating!
          </h1>
          <p className="text-slate-400 mb-10 text-sm uppercase tracking-[0.2em]">
            You’ve completed your 110-minute build session.
          </p>
          <div className="flex flex-col gap-4">
            <a
              href="/WorkSubmit"
              className="bg-emerald-400 text-black font-bold px-8 py-4 rounded-xl tracking-[0.2em] hover:bg-white transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
            >
              Submit Your Work
            </a>
            <button onClick={() => setHasFinished(false)} className="text-[10px] text-slate-600 underline uppercase mt-4">
              Return to Profile
            </button>
          </div>
        </motion.div>
      )}

      {isCountdown && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-[#02040a] text-white text-8xl font-black z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {count > 0 ? (
            <motion.span key={count} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} className="text-cyan-400">
              {count}
            </motion.span>
          ) : (
            <span className="text-4xl text-emerald-400 tracking-widest uppercase">Timer Starting...</span>
          )}
        </motion.div>
      )}

      {waitingForHost && !isActive && !isCountdown && !hasFinished && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center text-cyan-400 bg-[#02040a] z-50 p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-4xl font-black mb-4 animate-pulse">Waiting Room</p>
          <p className="text-sm text-slate-400 uppercase tracking-[0.3em] mb-8">Timer will be started by the host</p>
          <div className="max-w-md text-left text-slate-400 space-y-2 border border-cyan-500/20 rounded-xl p-6 bg-black/30 backdrop-blur-md">
            <h3 className="text-cyan-300 text-sm uppercase tracking-widest mb-3">Rules & Guidelines:</h3>
            <ul className="list-disc list-inside text-xs leading-relaxed">
              <li>Devices: Participants must bring there own laptops. Hight speed internet will be provided.</li>
              <li>AI Tools: Use of AI APIs(OpenAI, Gemini, Anthropic) and coding assistants is required.</li>
              <li>Neural Flow: Participants are expected to utilize AI models.</li>
              <li>Individual Participation: Individual participation is allowed.</li>
              <li>Submission Protocol: All project must be submitted before the specified deadline late submissions will not be accepted.</li>
              <li>Plagiarism: Copying entire pre-existing project is strictly prohibited.</li>
            </ul>
          </div>
        </motion.div>
      )}

      <div className="w-full max-w-2xl relative">
        <AnimatePresence mode="wait">
          {!isActive ? (
            <motion.form
              key="setup-form"
              variants={containerVars}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9 }}
              onSubmit={handleStart}
              className="bg-black/40 border border-cyan-500/20 p-10 rounded-xl backdrop-blur-3xl space-y-10"
            >
              <div className="text-center mb-4">
                <h2 className="text-[10px] tracking-[0.8em] text-cyan-500 uppercase font-bold">Initial_Entry_Protocol</h2>
              </div>

              {["name", "phone", "college", "course"].map((field, i) => (
                <motion.div variants={itemVars} key={field}>
                  <label className="block text-[9px] uppercase tracking-widest mb-4 text-cyan-500/40 font-bold italic">
                    {`0${i + 1}. ${field.toUpperCase()}`}
                  </label>
                  <input
                    type={field === "phone" ? "tel" : "text"}
                    required
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    placeholder={`INPUT_${field.toUpperCase()}`}
                    className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 rounded-t-md text-lg"
                  />
                </motion.div>
              ))}

              <motion.button
                variants={itemVars}
                whileHover={{ scale: 1.02, letterSpacing: "0.4em" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-cyan-500 py-6 text-black font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-white transition-all duration-500 cursor-pointer"
              >
                COMPILE & START
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              key="active-session"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-16">
                <div className="text-8xl md:text-[120px] font-black text-white drop-shadow-[0_0_40px_rgba(6,182,212,0.4)] tabular-nums leading-none">
                  {formatTime(timeLeft)}
                </div>
                <div className="mt-4 flex items-center justify-center gap-4 text-emerald-500">
                  <span className="text-[10px] tracking-[0.5em] animate-pulse font-bold">DEPLOYMENT_ACTIVE</span>
                </div>
              </div>

              <div className="w-full bg-white/5 border border-white/10 p-12 rounded-2xl backdrop-blur-md text-center">
                <p className="text-[10px] text-cyan-500/50 mb-2 uppercase tracking-widest italic">Target_Objective_Locked</p>
                <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-white italic">
                  "{topic}"
                </h3>
                <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  <span>Arch: {formData.name}</span>
                  <span>Sector: {formData.college}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}