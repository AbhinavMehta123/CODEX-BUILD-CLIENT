"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    navigation: [
      { name: "Home", href: "/" },
      { name: "About", href: "#about" },
      { name: "Rules", href: "#rules" },
    ],
    social: [
      { name: "Instagram", href: "https://instagram.com" },
      { name: "LinkedIN", href: "https://linkedin.com" },
    ]
  };

  return (
    <footer className="relative bg-[#02040a] pt-20 pb-10 font-mono border-t border-white/5 overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* BRANDING & SOURCE CREDIT */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500 flex items-center justify-center text-[10px] font-black shadow-[0_0_10px_rgba(6,182,212,0.5)] text-cyan-500">
                <img className="rounded-full" src="/WebAssets/codex-logo.jpeg" alt="" />
              </div>
              <span className="text-xl font-black tracking-tighter italic text-white uppercase">
                CODEX<span className="text-cyan-500">BUILD</span>
              </span>
            </div>
            
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm uppercase">
              The world&apos;s premier high-frequency engineering competition. 
              Designed for architects of the next-generation web.
            </p>

            {/* DEVELOPER CREDIT */}
            <div className="pt-2">
              <p className="text-[10px] text-slate-600 tracking-[0.2em] uppercase mb-2">Developed_By:</p>
              <div className="inline-flex items-center gap-3 px-3 py-2 border border-cyan-500/20 bg-cyan-500/5 rounded-sm hover:border-cyan-500/50 transition-colors group">
                <span className="text-xs font-black text-white tracking-widest group-hover:text-cyan-400 transition-colors">
                <a href="https://alfacodingclub.com">ALFA CODING CLUB</a>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]" />
              </div>
            </div>
          </div>

          {/* NAVIGATION MAP */}
          <div className="md:col-span-3">
            <h4 className="text-cyan-500/50 text-[10px] font-black tracking-[0.3em] uppercase mb-6">Menu_Root</h4>
            <ul className="space-y-4">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-gray-100 text-sm transition-colors flex items-center gap-2 group">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SOCIAL LINKS */}
          <div className="md:col-span-4">
            <h4 className="text-cyan-500/50 text-[10px] font-black tracking-[0.3em] uppercase mb-6">Social_Frequency</h4>
            <div className="grid grid-cols-1 gap-4">
              {footerLinks.social.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="p-3 border border-white/5 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-xs text-slate-400 hover:text-white italic"
                >
                  // {link.name.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
            <p className="text-slate-600 text-[9px] tracking-[0.2em] uppercase">
              © {currentYear} CODEX_CORP
            </p>
            <span className="hidden md:block text-slate-800">|</span>
            <p className="text-slate-600 text-[9px] tracking-[0.2em] uppercase">
              Terms_Of_Service // Data_Protocol
            </p>
          </div>
          
          <div className="flex gap-8">
             <span className="text-[9px] text-slate-700 tracking-widest uppercase italic">Latency: 14ms</span>
             <span className="text-[9px] text-slate-700 tracking-widest uppercase italic">Node: ALFA_CLUB_V1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}