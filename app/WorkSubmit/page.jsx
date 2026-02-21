'use client'
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { socket } from "@/utils/socket";

export default function WorkSubmit() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    projectDescription: "",
    githubRepo: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workEnabled, setWorkEnabled] = useState(true);

  useEffect(() => {
    // 1. Initial Status Check
    axios.get("https://codex-build-backend.onrender.com/api/hackathon/status")
      .then((res) => {
        if (!res.data.responsesOpen) {
          setWorkEnabled(false);
          router.push("/"); // Redirect immediately if already closed
        }
      })
      .catch((err) => console.error("Status fetch error:", err));

    // 2. Real-time Listeners
    const handleStop = () => {
      setWorkEnabled(false);
      // Optional: Add a small delay or alert before redirecting
      alert("🛑 Submissions have been closed. Redirecting to home...");
      router.push("/");
    };

    const handleAllow = () => {
      setWorkEnabled(true);
    };

    socket.on("stop_responses", handleStop);
    socket.on("hackathon_stopped", handleStop); // Redirect if hackathon ends
    socket.on("allow_responses", handleAllow);

    return () => {
      socket.off("stop_responses", handleStop);
      socket.off("hackathon_stopped", handleStop);
      socket.off("allow_responses", handleAllow);
    };
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!workEnabled) {
      alert("🚫 Work submission is currently closed.");
      router.push("/");
      return;
    }

    const { name, phone, projectDescription, githubRepo } = formData;
    if (!name || !phone || !projectDescription || !githubRepo) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "https://codex-build-backend.onrender.com/api/work/submit",
        formData
      );
      if (res.data.success) {
        setIsSubmitted(true);
        setTimeout(() => router.push("/"), 3000);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit work. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ... (containerVars and itemVars remain the same)
  const containerVars = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const itemVars = { hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } };

  return (
    <main className="min-h-screen bg-[#02040a] text-cyan-400 font-mono flex items-center justify-center p-6">
      {!isSubmitted ? (
        <motion.form
          variants={containerVars}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="bg-black/40 border border-cyan-500/20 p-10 rounded-xl backdrop-blur-3xl shadow-[0_0_50px_rgba(6,182,212,0.1)] space-y-8 w-full max-w-xl"
        >
          <motion.div variants={itemVars} className="text-center mb-4">
            <h2 className="text-[10px] tracking-[0.8em] text-cyan-500 uppercase font-bold">
              Work_Submission_Portal
            </h2>
          </motion.div>

          {[
            { id: "name", label: "Participant_Name", placeholder: "Enter your name" },
            { id: "phone", label: "Contact_Number", placeholder: "Enter your phone number" },
            { id: "projectDescription", label: "About_Project", placeholder: "Describe your project" },
            { id: "githubRepo", label: "GitHub_Repository", placeholder: "Enter your repo link" },
          ].map((field, i) => (
            <motion.div variants={itemVars} key={field.id}>
              <label className="block text-[9px] uppercase tracking-widest mb-4 text-cyan-500/40 font-bold italic">{`0${i + 1}. ${field.label}`}</label>
              {field.id === "projectDescription" ? (
                <textarea
                  required
                  rows="4"
                  value={formData[field.id]}
                  onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-all rounded-md placeholder:text-slate-800 text-lg"
                />
              ) : (
                <input
                  type={field.id === "phone" ? "tel" : "text"}
                  required
                  value={formData[field.id]}
                  onChange={(e) => {
                    const value = field.id === "phone" ? e.target.value.replace(/\D/g, "") : e.target.value;
                    setFormData({ ...formData, [field.id]: value });
                  }}
                  placeholder={field.placeholder}
                  className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-all rounded-t-md placeholder:text-slate-800 text-lg"
                />
              )}
            </motion.div>
          ))}

          <motion.button
            variants={itemVars}
            whileHover={{ scale: 1.02, letterSpacing: "0.4em" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !workEnabled}
            className="w-full bg-cyan-500 py-6 text-black font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-white transition-all duration-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "SUBMIT WORK"}
          </motion.button>
        </motion.form>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center bg-black/40 border border-emerald-400/30 p-10 rounded-xl shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <h1 className="text-4xl font-black text-emerald-400 mb-4">Work Submitted Successfully!</h1>
          <p className="text-slate-400 text-sm uppercase tracking-[0.2em]">Redirecting to homepage...</p>
        </motion.div>
      )}
    </main>
  );
}