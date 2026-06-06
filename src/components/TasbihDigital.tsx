import React, { useState, useEffect } from "react";
import { RotateCcw, Volume2, VolumeX, Sparkles, Plus, CheckCircle2, History, Trash2, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TasbihDigitalProps {
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

const PRESET_DZIKIR = [
  { id: "subhanallah", Lafazh: "سُبْحَانَ اللهِ", latin: "Subhanallah", arti: "Maha Suci Allah" },
  { id: "alhamdulillah", Lafazh: "الْحَمْدُ للهِ", latin: "Alhamdulillah", arti: "Segala Puji Bagi Allah" },
  { id: "allahuakbar", Lafazh: "اللهُ أَكْبَرُ", latin: "Allahu Akbar", arti: "Allah Maha Besar" },
  { id: "lailahaillallah", Lafazh: "لَا إِلٰهَ إِلَّا اللهُ", latin: "Laa Ilaaha Illallah", arti: "Tiada Tuhan Selain Allah" }
];

export default function TasbihDigital({ showToast }: TasbihDigitalProps) {
  const [activeDzikirIdx, setActiveDzikirIdx] = useState(0);
  const [counter, setCounter] = useState(0);
  const [targetCount, setTargetCount] = useState<number>(33); // 33, 99, 100, or 0 (unlimited)
  const [isMuted, setIsMuted] = useState(false);
  const [isVibeEnabled, setIsVibeEnabled] = useState(true);
  const [lifetimeCount, setLifetimeCount] = useState(0);
  const [sessionCompletedRounds, setSessionCompletedRounds] = useState<number>(0);

  const activeDzikir = PRESET_DZIKIR[activeDzikirIdx];

  // Load counter values on component mount
  useEffect(() => {
    const savedCount = localStorage.getItem("mbah_yani_tasbih_count");
    if (savedCount) {
      setCounter(parseInt(savedCount, 10));
    }
    const savedLifetime = localStorage.getItem("mbah_yani_tasbih_lifetime");
    if (savedLifetime) {
      setLifetimeCount(parseInt(savedLifetime, 10));
    }
    const savedRounds = localStorage.getItem("mbah_yani_tasbih_rounds");
    if (savedRounds) {
      setSessionCompletedRounds(parseInt(savedRounds, 10));
    }
  }, []);

  // Save counter on value changes
  const updateCountsInStorage = (newVal: number) => {
    localStorage.setItem("mbah_yani_tasbih_count", newVal.toString());
  };

  // Synthesize soft audio tick (no asset files needed!)
  const playAudioTick = (freq: number = 800, duration: number = 0.08) => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error("Audio Synthesis failed:", e);
    }
  };

  const incrementCounter = () => {
    const nextVal = counter + 1;
    setCounter(nextVal);
    updateCountsInStorage(nextVal);

    // Update Lifetime
    const nextLifetime = lifetimeCount + 1;
    setLifetimeCount(nextLifetime);
    localStorage.setItem("mbah_yani_tasbih_lifetime", nextLifetime.toString());

    // Audio & Haptic vibration feedback
    if (isVibeEnabled && navigator.vibrate) {
      navigator.vibrate(40); // 40ms light pulse
    }

    // Checking of Target Hit
    if (targetCount > 0 && nextVal === targetCount) {
      // Loop or Finish round trigger
      playAudioTick(1200, 0.25); // higher pitches reward sound
      if (isVibeEnabled && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // double heavy pulse
      }
      
      const newRounds = sessionCompletedRounds + 1;
      setSessionCompletedRounds(newRounds);
      localStorage.setItem("mbah_yani_tasbih_rounds", newRounds.toString());

      showToast(`Mendekati target! Putaran ke-${newRounds} untuk ${activeDzikir.latin} selesai!`, "success");
      setCounter(0);
      updateCountsInStorage(0);
    } else {
      playAudioTick(800, 0.05); // standard click
    }
  };

  const resetCounter = () => {
    setCounter(0);
    updateCountsInStorage(0);
    playAudioTick(400, 0.15); // low pitch reset confirmation chime
    showToast("Tasbih direset kembali ke nol", "info");
  };

  const registerPresetChange = (idx: number) => {
    setActiveDzikirIdx(idx);
    setCounter(0);
    updateCountsInStorage(0);
    playAudioTick(700, 0.07);
    showToast(`Dzikir diubah ke: ${PRESET_DZIKIR[idx].latin}`, "info");
  };

  const changeLimitTarget = (target: number) => {
    setTargetCount(target);
    setCounter(0);
    updateCountsInStorage(0);
    playAudioTick(900, 0.08);
    showToast(`Limit putaran diubah: ${target > 0 ? target + " kali" : "Tanpa Batas"}`, "info");
  };

  const resetLifetimeAndRounds = () => {
    if (confirm("Anda yakin ingin menghapus data rekap total dzikir keluarga?")) {
      setLifetimeCount(0);
      setSessionCompletedRounds(0);
      localStorage.removeItem("mbah_yani_tasbih_lifetime");
      localStorage.removeItem("mbah_yani_tasbih_rounds");
      showToast("Data riwayat total berhasil dibersihkan", "success");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" id="tasbih-section">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          Tasbih Digital
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm md:text-base">
          Dzikir online harian keluarga dengan getaran dan suara penanda limit target.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-stretch">
        {/* Left column: configurations */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6">
          {/* Preset Buttons */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Pilih Kalimat Dzikir
            </h3>
            <div className="flex flex-col gap-2">
              {PRESET_DZIKIR.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => registerPresetChange(index)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeDzikirIdx === index
                      ? "bg-emerald-500/10 border-emerald-400 text-emerald-900 dark:text-emerald-400 ring-2 ring-emerald-500/5"
                      : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/45 dark:border-slate-800 dark:text-slate-200 hover:border-slate-350"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{item.latin}</span>
                    <span className="font-arabic font-bold text-base text-emerald-800 dark:text-teal-300 leading-none">
                      {item.Lafazh}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    {item.arti}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Boundaries Limits */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Limit Siklus Target
            </h3>
            <div className="grid grid-cols-4 gap-1.5 font-mono text-sm">
              {[33, 99, 100, 0].map((t) => (
                <button
                  key={t}
                  onClick={() => changeLimitTarget(t)}
                  className={`py-2 rounded-lg border transition-all font-bold cursor-pointer ${
                    targetCount === t
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {t === 0 ? "Bebas" : t}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback buttons */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center justify-center gap-2 py-2 border rounded-xl hover:bg-slate-50 text-slate-600 dark:text-slate-300 dark:bg-slate-800/40 dark:border-slate-800 cursor-pointer"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span className="text-xs">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs">Suara ON</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsVibeEnabled(!isVibeEnabled)}
              className="flex items-center justify-center gap-2 py-2 border rounded-xl hover:bg-slate-50 text-slate-600 dark:text-slate-300 dark:bg-slate-800/40 dark:border-slate-800 cursor-pointer"
            >
              <Smartphone className={`w-4 h-4 ${isVibeEnabled ? "text-emerald-500" : "text-slate-400"}`} />
              <span className="text-xs">{isVibeEnabled ? "Getar Aktif" : "Getar OFF"}</span>
            </button>
          </div>
        </div>

        {/* Right column: Big Interactive Counter Button */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-between gap-6 relative min-h-[460px]">
          {/* Small progress badge */}
          <div className="text-center">
            <span className="text-[11px] font-sans font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
              KALIMAT DZIKIR SAAT INI
            </span>
            <h1 className="text-2xl font-arabic font-bold text-slate-800 dark:text-slate-100 mt-2">
              {activeDzikir.Lafazh}
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs italic mt-0.5">
              "{activeDzikir.arti}"
            </p>
          </div>

          {/* HUGE CLICK BUTTON */}
          <div className="relative">
            {/* outer ripple rings */}
            <div className="absolute inset-[-15px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/2 translate-y-2 animate-pulse"></div>
            
            <button
              onClick={incrementCounter}
              className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-mono shadow-2xl flex flex-col items-center justify-center border-4 border-white dark:border-slate-800 cursor-pointer transition-transform duration-100 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            >
              {/* Display Big Digit */}
              <span className="text-6xl md:text-7xl font-bold font-mono tracking-tighter block leading-none">
                {counter}
              </span>

              {/* Display target indicator at footer of ring */}
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-100/80 mt-2 font-sans">
                {targetCount > 0 ? `Target: ${targetCount}` : "BEBAS"}
              </span>

              {/* Interactive micro prompt */}
              <span className="text-[9px] text-emerald-200 font-sans group-hover:text-white uppercase tracking-widest mt-1 block">
                [ TEKAN ]
              </span>
            </button>
          </div>

          {/* Quick controls: Reset & Summary */}
          <div className="w-full flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <div className="text-left text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Siklus Tercapai: <strong className="font-mono">{sessionCompletedRounds}</strong> putaran</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Kumulatif Dzikir: <strong className="font-mono">{lifetimeCount}</strong> kali</span>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-center gap-2">
              {(lifetimeCount > 0 || sessionCompletedRounds > 0) && (
                <button
                  onClick={resetLifetimeAndRounds}
                  title="Hapus Total Rekap"
                  className="text-slate-400 hover:text-red-500 p-2 border border-slate-100 dark:border-slate-800 hover:border-red-100 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={resetCounter}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 font-semibold px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Angka</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
