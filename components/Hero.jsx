"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function CodexCircuitHero() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      id="home"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex flex-col items-start lg:items-center bg-[#02040a] overflow-hidden px-6 lg:px-24 font-mono pt-24 lg:pt-0"
    >
      {/* BACKGROUND CIRCUIT DECORATION */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] lg:w-[800px] lg:h-[800px] bg-blue-500/5 rounded-full blur-[80px] lg:blur-[120px]" />

      {/* MAIN CONTENT — grows to fill space */}
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-12 items-center relative z-10 flex-1 w-full my-auto">
        {/* LEFT: MISSION CONTROL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center lg:text-left order-2 lg:order-1"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 lg:mb-8">
            <span className="w-8 lg:w-12 h-[1px] bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
            <span className="text-cyan-500 text-[10px] font-bold tracking-[0.2em] lg:tracking-[0.4em] uppercase">
              System.Status: Operational
            </span>
          </div>

          <div className="flex flex-col items-center lg:items-start justify-center text-center lg:text-left">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">
              CODEX<span className="text-cyan-500"> Build</span>
            </h1>

            <p className="text-slate-400 text-sm lg:text-lg max-w-md mx-auto lg:mx-0 mb-10 lg:mb-12 border-none lg:border-l-2 border-cyan-500/30 lg:pl-6 leading-relaxed">
              The ultimate build-a-thon for high-performance engineers. 110
              minutes. Infinite logic. Zero downtime.
            </p>

            <div className="flex justify-center lg:justify-start w-full">
              <Link href="/StartBuild">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 0px 30px rgba(6,182,212,0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-10 lg:px-12 py-4 lg:py-5 bg-transparent border-2 border-cyan-500 text-cyan-400 font-black tracking-[0.2em] group overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 group-hover:text-black transition-colors text-xs lg:text-base">
                    START_BUILDING()
                  </span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: THE CIRCULAR "CORE" IMAGE */}
        <motion.div
          style={{ rotateX, rotateY, perspective: 1000 }}
          className="relative flex justify-center items-center order-1 lg:order-2 scale-75 lg:scale-100"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] border-[1px] border-dashed border-cyan-500/30 rounded-full hidden sm:block"
          />

          <div className="relative w-[280px] h-[280px] lg:w-[400px] lg:h-[400px] rounded-full p-2 border-4 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.3)] bg-black overflow-hidden group">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/WebAssets/codex-logo.jpeg"
                alt="AI Build Theme"
                fill
                className="object-cover opacity-70 group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-blue-900/20 mix-blend-color" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/80 border border-cyan-500/50 backdrop-blur-md rounded text-cyan-400 text-[8px] lg:text-[10px] font-bold tracking-[0.3em]">
              CORE_ACTIVE
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-4 -right-2 lg:right-0 p-3 lg:p-4 bg-black/60 border border-cyan-500/20 backdrop-blur-sm rounded-lg"
          >
            <div className="text-[8px] lg:text-[10px] text-cyan-500 font-bold tracking-tighter uppercase">
              Latency
            </div>
            <div className="text-lg lg:text-xl text-white font-black leading-none">
              0.04ms
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* =============================================
                SPONSORS BAR — sits in the marked green area
                above the bottom grid floor
            ============================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 w-full container mx-auto mb-10 lg:mb-14"
      >
        {/* Divider line with label */}
        <div className="flex items-center gap-4 mb-6 mt-7 sm:mt-0">
          <span className="flex-1 h-px bg-cyan-500/20" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-cyan-500/60 uppercase">
            Sponsored By
          </span>
          <span className="flex-1 h-px bg-cyan-500/20" />
        </div>

        {/* Sponsor Logos Row */}
        <div className="flex items-center justify-center gap-8 lg:gap-16 flex-wrap">
          {/* Sponsor 1: Fateh */}
          <motion.div
            transition={{ type: "spring", stiffness: 300 }}
            className="relative h-12 lg:h-16 w-40 lg:w-56  transition-opacity duration-300 rounded-2xl overflow-hidden"
          >
            <Image
              src="/WebAssets/fateh-logo.jpeg"
              alt="Fateh – Conquer Your Dreams"
              fill
              className="object-contain "
            />
          </motion.div>

          {/* Thin vertical separator — hidden on mobile */}
          <div className="hidden lg:block h-10 w-px bg-cyan-500/20" />

          {/* Sponsor 2: NeoSankalp */}
          <motion.div
            transition={{ type: "spring", stiffness: 300 }}
            className="relative h-12 lg:h-16 w-40 lg:w-56  transition-opacity duration-300 "
          >
            <Image
              src="/WebAssets/neosankalp-logo.jpeg"
              alt="NeoSankalp – Empowering Tech"
              fill
              className="object-contain"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* BOTTOM GRID FLOOR */}
      <div className="absolute bottom-0 left-0 w-full h-32 lg:h-48 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[30px_30px] lg:bg-size-[40px_40px] opacity-10 mask-[linear-gradient(to_top,black,transparent)]" />
    </section>
  );
}
