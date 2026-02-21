"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function WorkSubmit() {
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    github: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, about, github } = formData;
    if (!name || !about || !github) {
      alert("⚠️ Please fill in all fields before submitting.");
      return;
    }

    try {
      // 🔗 Replace this endpoint with your backend submission API if needed
      await axios.post("https://codex-build-backend.onrender.com/api/submitWork", formData);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting work:", err);
      alert("Unable to submit at the moment. Please try again later.");
    }
  };

  const containerVars = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVars = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <main className="min-h-screen bg-[#02040a] text-cyan-400 font-mono p-6 flex flex-col items-center justify-center">
      {!submitted ? (
        <motion.form
          key="submit-form"
          variants={containerVars}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-black/40 border border-cyan-500/20 p-10 rounded-xl backdrop-blur-3xl shadow-[0_0_50px_rgba(6,182,212,0.1)] space-y-10 overflow-hidden"
        >
          <motion.div variants={itemVars} className="text-center mb-4">
            <h2 className="text-[10px] tracking-[0.8em] text-cyan-500 uppercase font-bold">
              Final_Submission_Form
            </h2>
          </motion.div>

          {/* 🧑 Your Name */}
          <motion.div variants={itemVars}>
            <label className="block text-[9px] uppercase tracking-widest mb-4 text-cyan-500/40 font-bold italic">
              01. Identity_Check
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="INPUT_YOUR_NAME"
              className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-all rounded-t-md placeholder:text-slate-800 text-lg"
            />
          </motion.div>

          {/* 🧾 About Project */}
          <motion.div variants={itemVars}>
            <label className="block text-[9px] uppercase tracking-widest mb-4 text-cyan-500/40 font-bold italic">
              02. About_Project
            </label>
            <textarea
              required
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              placeholder="DESCRIBE_YOUR_PROJECT"
              className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-all rounded-md placeholder:text-slate-800 text-lg min-h-[120px]"
            />
          </motion.div>

          {/* 🔗 GitHub Repo */}
          <motion.div variants={itemVars}>
            <label className="block text-[9px] uppercase tracking-widest mb-4 text-cyan-500/40 font-bold italic">
              03. Repository_Link
            </label>
            <input
              type="url"
              required
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="INPUT_GITHUB_REPO_URL"
              className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-all rounded-t-md placeholder:text-slate-800 text-lg"
            />
          </motion.div>

          {/* 🚀 Submit Button */}
          <motion.button
            variants={itemVars}
            whileHover={{ scale: 1.02, letterSpacing: "0.5em" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-cyan-500 py-6 text-black font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-white transition-all duration-500 cursor-pointer"
          >
            Submit Project
          </motion.button>
        </motion.form>
      ) : (
        <motion.div
          key="submitted"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <h1 className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            ✅ Submission Successful!
          </h1>
          <p className="text-slate-400 text-sm tracking-[0.3em] uppercase">
            Thank you for submitting your project.
          </p>
          <a
            href="/"
            className="mt-6 inline-block px-10 py-4 bg-cyan-500 text-black font-bold uppercase tracking-[0.2em] rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:bg-white transition-all"
          >
            Return to Home
          </a>
        </motion.div>
      )}
    </main>
  );
}