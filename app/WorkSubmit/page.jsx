"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, phone, projectDescription, githubRepo } = formData;

    if (!name || !phone || !projectDescription || !githubRepo) {
      alert("Please fill in all fields.");
      return;
    }

    // Extra phone validation
    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be exactly 10 digits.");
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

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push("/"); // Redirect to home page
        }, 3000);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit work. Please try again later.");
    } finally {
      setLoading(false);
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
              <label className="block text-[9px] uppercase tracking-widest mb-4 text-cyan-500/40 font-bold italic">
                {`0${i + 1}. ${field.label}`}
              </label>

              {field.id === "projectDescription" ? (
                <textarea
                  required
                  rows="4"
                  value={formData[field.id]}
                  onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-all rounded-md placeholder:text-slate-800 text-lg"
                />
              ) : field.id === "phone" ? (
                <input
                  type="tel"
                  required
                  value={formData[field.id]}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // allow only numbers
                    setFormData({ ...formData, [field.id]: value });
                  }}
                  placeholder={field.placeholder}
                  pattern="\d{10}" // exactly 10 digits
                  title="Phone number must be 10 digits"
                  className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-all rounded-t-md placeholder:text-slate-800 text-lg"
                />
              ) : (
                <input
                  type="text"
                  required
                  value={formData[field.id]}
                  onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
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
            disabled={loading}
            className="w-full bg-cyan-500 py-6 text-black font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-white transition-all duration-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "SUBMIT WORK"}
          </motion.button>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-black/40 border border-emerald-400/30 p-10 rounded-xl shadow-[0_0_50px_rgba(16,185,129,0.2)]"
        >
          <h1 className="text-4xl font-black text-emerald-400 mb-4">
            ✅ Work Submitted Successfully!
          </h1>
          <p className="text-slate-400 text-sm uppercase tracking-[0.2em]">
            Redirecting to homepage...
          </p>
        </motion.div>
      )}
    </main>
  );
}