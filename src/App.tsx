import React, { useState, useEffect } from "react";
import {
  Compass,
  BookOpen,
  Sparkles,
  BookMarked,
  Clock,
  Heart,
  Moon,
  Sun,
  Menu,
  X,
  Share2,
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  MessageSquare,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Components
import CariKiblat from "./components/CariKiblat";
import AlQuran from "./components/AlQuran";
import TasbihDigital from "./components/TasbihDigital";
import DoaHarian from "./components/DoaHarian";
import JadwalSholat from "./components/JadwalSholat";
import AsmaulHusna from "./components/AsmaulHusna";
import ToastContainer, { ToastType } from "./components/Toast";

// Hadist Quotes for slider
const ISLAMIC_QUOTES = [
  { text: "Maka nikmat Tuhanmu yang manakah yang kamu dustakan?", source: "QS. Ar-Rahman: 13" },
  { text: "Sesungguhnya bersama kesulitan ada kemudahan.", source: "QS. Al-Insyirah: 6" },
  { text: "Jadikanlah sabar dan shalat sebagai penolongmu.", source: "QS. Al-Baqarah: 45" },
  { text: "Barangsiapa mempermudah urusan orang, Allah mempermudah urusannya di dunia & akhirat.", source: "Hadits Riwayat Muslim" },
  { text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.", source: "Hadits Riwayat Ahmad" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home"); // home, kiblat, quran, tasbih, doa, sholat, asmaul
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Custom Toast State
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const showToast = (message: string, type: "success" | "info" | "error" = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Dark Mode side effects
  useEffect(() => {
    const savedTheme = localStorage.getItem("mbah_yani_dark_mode");
    if (savedTheme === "true") {
      setIsDarkMode(true);
      document.body.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.body.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    if (nextVal) {
      document.body.classList.add("dark");
      localStorage.setItem("mbah_yani_dark_mode", "true");
      showToast("Mode malam diaktifkan", "info");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("mbah_yani_dark_mode", "false");
      showToast("Mode siang diaktifkan", "info");
    }
  };

  // Rotate quotes
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length);
    }, 10000); // 10 seconds rotate
    return () => clearInterval(quoteTimer);
  }, []);

  const triggerScrollToActive = () => {
    setTimeout(() => {
      const el = document.getElementById("active-feature-container");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (tabId !== "home") {
      triggerScrollToActive();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] dark:bg-[#090d16] text-[#0f172a] dark:text-[#f1f5f9] relative transition-colors duration-300">
      {/* Decorative Islamic grid dot background */}
      <div className="absolute inset-0 bg-islamic-pattern pointer-events-none z-0"></div>

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo & Family name */}
          <div
            onClick={() => selectTab("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:rotate-12 transition-transform">
              🕌
            </div>
            <div>
              <h1 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg leading-tight tracking-tight">
                Portal Islami Mbah Yani
              </h1>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans tracking-wide uppercase font-extrabold">
                Keluarga Besar harian
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
            <button
              onClick={() => selectTab("home")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => selectTab("kiblat")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "kiblat"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              Cari Kiblat
            </button>
            <button
              onClick={() => selectTab("quran")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "quran"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              Al-Qur'an
            </button>
            <button
              onClick={() => selectTab("tasbih")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "tasbih"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              Tasbih
            </button>
            <button
              onClick={() => selectTab("doa")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "doa"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              Doa Harian
            </button>
            <button
              onClick={() => selectTab("sholat")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "sholat"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              Jadwal Sholat
            </button>
            <button
              onClick={() => selectTab("asmaul")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "asmaul"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              Asmaul Husna
            </button>
          </nav>

          {/* Theme & Burger Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 mr-1 rounded-xl bg-slate-55/60 dark:bg-slate-800 text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
              title="Ganti Tema Warna"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden rounded-xl bg-slate-55/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 w-full overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-2 font-display font-semibold uppercase tracking-wide text-xs">
                <button
                  onClick={() => selectTab("home")}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    activeTab === "home"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  🏠 Beranda Utama
                </button>
                <button
                  onClick={() => selectTab("kiblat")}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    activeTab === "kiblat"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  🧭 Cari Kiblat
                </button>
                <button
                  onClick={() => selectTab("quran")}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    activeTab === "quran"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  📖 Al-Qur'an Digital
                </button>
                <button
                  onClick={() => selectTab("tasbih")}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    activeTab === "tasbih"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  📿 Tasbih Counter
                </button>
                <button
                  onClick={() => selectTab("doa")}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    activeTab === "doa"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  🤲 Doa Sehari-hari
                </button>
                <button
                  onClick={() => selectTab("sholat")}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    activeTab === "sholat"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  ⏰ Jadwal Sholat
                </button>
                <button
                  onClick={() => selectTab("asmaul")}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    activeTab === "asmaul"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  ✨ Asmaul Husna
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Jumbotron Content */}
      <main className="flex-1 w-full relative z-10">
        
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto my-6 px-6 py-10 md:py-14 rounded-3xl hero-gradient text-white grid md:grid-cols-12 gap-8 items-center relative overflow-hidden shadow-xl border border-emerald-500/10">
          
          {/* Islamic background grid overlay purely for hero */}
          <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none"></div>

          {/* Hero text */}
          <div className="md:col-span-7 space-y-6 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-emerald-100 py-1.5 px-3.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#D4AF37] animate-spin" />
              Ibadah Lebih Berkah Bersama Keluarga
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
              Portal Islami <span className="text-[#D4AF37]">Keluarga Mbah Yani</span>
            </h1>

            <p className="text-emerald-105/90 text-sm md:text-base leading-relaxed max-w-xl mx-auto md:mx-0">
              Menemani ibadah harian seluruh sanak keluarga, lansia, dan cucu-cucu Mbah Yani dengan layanan Qibla Compass, Murottal Qur'an, Tasbih, dan Doa Shalat secara mandiri harian.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={() => selectTab("sholat")}
                className="bg-[#D4AF37] hover:bg-amber-500 text-emerald-950 font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 text-sm"
              >
                <Clock className="w-4 h-4 text-emerald-950" />
                Mulai Ibadah (Jadwal Sholat)
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("main-menu-grid");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3 px-5 rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5 text-sm backdrop-blur-sm"
              >
                Jelajah Fitur Menu
                <ArrowDownCircle className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          </div>

          {/* Hero Image Illustration (CSS Styled Arabic Dome and Starry Moon Night) */}
          <div className="md:col-span-5 flex items-center justify-center relative z-10">
            <div className="relative w-72 h-72 md:w-80 md:h-80 bg-white/10 dark:bg-black/20 rounded-3xl p-6 flex flex-col justify-between items-center overflow-hidden border border-white/20 shadow-inner backdrop-blur-xs">
              
              {/* Starry dots / Moon */}
              <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-gradient-to-tr from-amber-300 to-amber-500 opacity-90 shadow-2xl skew-x-3 pointer-events-none"></div>
              <div className="absolute top-10 right-13 w-20 h-20 rounded-full bg-emerald-700/60 dark:bg-emerald-950/60 pointer-events-none"></div>

              {/* Minaret / Masjid silhouettes */}
              <div className="absolute bottom-0 w-full h-80 flex items-end justify-center pointer-events-none gap-2 px-6">
                <div className="w-4 h-24 bg-white/10 rounded-t-full"></div>
                <div className="w-16 h-36 bg-white/25 rounded-t-full relative flex items-center justify-center">
                  <div className="absolute top-[-100px] text-[#D4AF37] font-bold text-3xl">🌙</div>
                  <div className="w-3 h-10 bg-white/15 rounded-full mb-12"></div>
                </div>
                <div className="w-10 h-20 bg-white/10 rounded-t-full"></div>
              </div>

              {/* Hover highlight stars */}
              <div className="absolute top-1/2 left-8 text-amber-300 text-xl font-bold animate-ping">★</div>
              <div className="absolute top-1/4 right-3 text-amber-300 text-sm animate-pulse">✦</div>
            </div>
          </div>
        </section>

        {/* CARDS MENU CHANNELS (Tiru gaya "Healing Bareng" menu layout grid cards) */}
        <section className="max-w-6xl mx-auto px-4 py-8 border-t border-slate-100 dark:border-slate-800/80" id="main-menu-grid">
          <div className="text-center mb-8">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">
              Saluran Berkah Ibadah
            </h3>
            <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100 mt-1">
              Pilihan Layanan Digital Utama
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {/* 1. CARI KIBLAT */}
            <div
              onClick={() => selectTab("kiblat")}
              className={`p-5 rounded-2xl cursor-pointer flex flex-col justify-between min-h-[160px] group feature-card transition-all ${
                activeTab === "kiblat"
                  ? "bg-emerald-500/10 border-[#D4AF37] ring-2 ring-emerald-500/5"
                  : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-405 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  🧭
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  KOMPAS
                </span>
              </div>
              <div className="mt-4">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Cari Kiblat
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                  Kompas arah kaabah realtime
                </p>
              </div>
            </div>

            {/* 2. AL QURAN */}
            <div
              onClick={() => selectTab("quran")}
              className={`p-5 rounded-2xl cursor-pointer flex flex-col justify-between min-h-[160px] group feature-card transition-all ${
                activeTab === "quran"
                  ? "bg-emerald-500/10 border-[#D4AF37] ring-2 ring-emerald-500/5"
                  : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  📖
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  QUR'AN
                </span>
              </div>
              <div className="mt-4">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Al-Qur'an Digital
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                  114 Surah, audio & terjemah
                </p>
              </div>
            </div>

            {/* 3. TASBIH */}
            <div
              onClick={() => selectTab("tasbih")}
              className={`p-5 rounded-2xl cursor-pointer flex flex-col justify-between min-h-[160px] group feature-card transition-all ${
                activeTab === "tasbih"
                  ? "bg-emerald-500/10 border-[#D4AF37] ring-2 ring-emerald-500/5"
                  : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  📿
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  COUNTERS
                </span>
              </div>
              <div className="mt-4">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Tasbih Digital
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                  Penghitung dzikir getar & limit
                </p>
              </div>
            </div>

            {/* 4. DOA HARIAN */}
            <div
              onClick={() => selectTab("doa")}
              className={`p-5 rounded-2xl cursor-pointer flex flex-col justify-between min-h-[160px] group feature-card transition-all ${
                activeTab === "doa"
                  ? "bg-emerald-500/10 border-[#D4AF37] ring-2 ring-emerald-500/5"
                  : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  🤲
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  MEMORIZED
                </span>
              </div>
              <div className="mt-4">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Doa Sehari-hari
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                  Koleksi doa harian ringkas
                </p>
              </div>
            </div>

            {/* 5. JADWAL SHOLAT */}
            <div
              onClick={() => selectTab("sholat")}
              className={`p-5 rounded-2xl cursor-pointer flex flex-col justify-between min-h-[160px] group feature-card transition-all ${
                activeTab === "sholat"
                  ? "bg-emerald-500/10 border-[#D4AF37] ring-2 ring-emerald-500/5"
                  : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  ⏰
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  TIMELINE
                </span>
              </div>
              <div className="mt-4">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Jadwal Sholat
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                  Hitung mundur jadwal waktu adzan
                </p>
              </div>
            </div>

            {/* 6. ASMAUL HUSNA */}
            <div
              onClick={() => selectTab("asmaul")}
              className={`p-5 rounded-2xl cursor-pointer flex flex-col justify-between min-h-[160px] group feature-card transition-all ${
                activeTab === "asmaul"
                  ? "bg-emerald-500/10 border-[#D4AF37] ring-2 ring-emerald-500/5"
                  : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  NAMES
                </span>
              </div>
              <div className="mt-4">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Asmaul Husna
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                  99 Nama Asma Allah SWT
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE FEATURE MODULE CONTAINER (Where the routed component renders seamlessly) */}
        <div className="w-full bg-slate-50 dark:bg-slate-950/40 border-t border-b border-slate-100 dark:border-slate-850 py-10" id="active-feature-container">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {activeTab === "home" && (
                  <div className="text-center py-12 px-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-100">
                      📯
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">
                      Silakan Pilih Salah Satu Fitur Layanan di Atas
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                      Klik salah satu kartu menu utama di atas untuk membuka dashboard kompas kiblat, pemutar Al-Qur'an, tasbih dzikir, maupun jadwal shalat.
                    </p>
                  </div>
                )}

                {activeTab === "kiblat" && <CariKiblat showToast={showToast} />}
                {activeTab === "quran" && <AlQuran showToast={showToast} />}
                {activeTab === "tasbih" && <TasbihDigital showToast={showToast} />}
                {activeTab === "doa" && <DoaHarian showToast={showToast} />}
                {activeTab === "sholat" && <JadwalSholat showToast={showToast} />}
                {activeTab === "asmaul" && <AsmaulHusna showToast={showToast} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* FLOATING DHIKR QUOTE BAR (Hadist Slider Picked) */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0">
              ✍
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[10px] bg-emerald-600/10 text-emerald-800 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest leading-none inline-block">
                Kalam Renungan
              </span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm font-semibold text-slate-850 dark:text-slate-100 italic font-sans block leading-relaxed pr-6">
                    "{ISLAMIC_QUOTES[quoteIndex].text}"
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                    — {ISLAMIC_QUOTES[quoteIndex].source}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Switch controls */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => setQuoteIndex((prev) => (prev - 1 + ISLAMIC_QUOTES.length) % ISLAMIC_QUOTES.length)}
                className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length)}
                className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer copyright */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6 text-center md:text-left text-xs text-slate-500">
          
          <div className="space-y-2">
            <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-200">
              Portal Islami Keluarga Mbah Yani
            </h4>
            <p className="leading-relaxed">
              Dibuat khusus sebagai panduan dan teman ibadah digital harian keluarga besar Mbah Yani. Semoga mendatangkan keberkahan dan syafaat bagi kita semua.
            </p>
          </div>

          <div className="space-y-2 flex flex-col items-center md:items-start justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              PANDUAN HADITS
            </span>
            <p className="italic leading-relaxed max-w-xs">
              "Bacalah oleh kalian Al-Qur'an. Karena sesungguhnya ia akan datang pada Hari Kiamat sebagai penolong bagi pembacanya." (HR. Muslim)
            </p>
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div className="flex justify-center md:justify-end gap-3 text-lg">
              <span className="cursor-default" title="Ibadah">📿</span>
              <span className="cursor-default" title="Al-Qur'an">📖</span>
              <span className="cursor-default" title="Kiblat">🧭</span>
              <span className="cursor-default" title="Berkah">✨</span>
            </div>
            
            <div className="text-center md:text-right space-y-1">
              <p className="font-mono">
                © {new Date().getFullYear()} Portal Islami Mbah Yani.
              </p>
              <p className="text-[10px] tracking-wide uppercase font-semibold text-slate-400">
                Temani Ibadah Keluarga Setiap Hari
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Portal Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
