"use client";

import { useEffect, useState, useLayoutEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Loader from "./Loader"; 

export default function GlobalLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Function called by the Loader component when progress hits 100
  const handleLoaderFinished = useCallback(() => {
    setIsLoading(false);
    // Add a slight delay before removing from DOM for the fade-out effect
    setTimeout(() => setIsVisible(false), 800); 
  }, []);

  // ✅ 1. Handle Route Changes
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Every time the path changes, we show the loader again
    setIsLoading(true);
    setIsVisible(true);
    
    // Note: We no longer use a setTimeout here. 
    // The Loader component will trigger handleLoaderFinished.
  }, [pathname]);

  // ✅ 2. Reactive Network Status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // When back online, we let the loader finish its cycle
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
      setIsLoading(true);
    };

    if (!navigator.onLine) handleOffline();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ✅ 3. Lock Scroll
  useEffect(() => {
    if (isLoading || isOffline) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isLoading, isOffline]);

  if (!isVisible && !isOffline) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#02040a] text-center font-mono transition-opacity duration-700 ${
        isLoading || isOffline ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Pass the completion function to the visual Loader */}
      <Loader onComplete={handleLoaderFinished} />

      {isOffline && (
        <div className="absolute bottom-16 flex flex-col items-center gap-3 px-8">
          <div className="flex items-center gap-3 px-5 py-2 rounded-sm bg-red-500/10 border border-red-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <p className="text-red-500 font-bold text-[10px] tracking-[0.2em] uppercase">
              CRITICAL: Neural_Link_Lost // Offline_Mode_Active
            </p>
          </div>
        </div>
      )}
    </div>
  );
}