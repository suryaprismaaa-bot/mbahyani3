import React, { useState, useEffect, useRef } from "react";
import { BookOpen, Search, Volume2, Bookmark, Heart, ChevronLeft, ArrowRight, Play, Pause, Square, AlertCircle, Settings2, Sliders } from "lucide-react";
import { surahList, SurahMeta } from "../data/surahList";
import { SurahDetail, Verse } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AlQuranProps {
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

export default function AlQuran({ showToast }: AlQuranProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSurahNum, setActiveSurahNum] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User Preferences
  const [arabicFontSize, setArabicFontSize] = useState<number>(28); // Default 28px
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showLatin, setShowLatin] = useState<boolean>(true);

  // Bookmarks & Last Read State
  const [bookmarks, setBookmarks] = useState<{ surahNum: number; surahName: string; verseNum: number }[]>([]);
  const [lastRead, setLastRead] = useState<{ surahNum: number; surahName: string; verseNum: number } | null>(null);

  // Audio Player State
  const [currentPlayingVerse, setCurrentPlayingVerse] = useState<number | null>(null);
  const [isPlayingSurahAudio, setIsPlayingSurahAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter Surahs
  const filteredSurahs = surahList.filter(
    (s) =>
      s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.arti.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nama.includes(searchQuery)
  );

  // Load bookmarks & last read on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("mbah_yani_quran_bookmarks");
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    const savedLastRead = localStorage.getItem("mbah_yani_quran_last_read");
    if (savedLastRead) {
      setLastRead(JSON.parse(savedLastRead));
    }
  }, []);

  // Fetch Surah Detail (with LocalStorage cache)
  const loadSurah = async (surahNum: number, scrolltoVerse?: number) => {
    setLoading(true);
    setError(null);
    setSurahDetail(null);
    setActiveSurahNum(surahNum);

    // Stop any active audio
    stopAudio();

    const cacheKey = `mbah_yani_surah_${surahNum}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setSurahDetail(parsed);
        setLoading(false);
        if (scrolltoVerse) {
          setTimeout(() => scrollToVerseElement(scrolltoVerse), 500);
        }
        return;
      } catch (e) {
        console.error("Cache parsing failed", e);
      }
    }

    try {
      const response = await fetch(`https://equran.id/api/v2/surat/${surahNum}`);
      if (!response.ok) {
        throw new Error("Gagal mengambil data Surat dari server.");
      }
      const json = await response.json();
      if (json.code === 200 && json.data) {
        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify(json.data));
        setSurahDetail(json.data);
      } else {
        throw new Error("Format data respon tidak didukung.");
      }
    } catch (err: any) {
      setError(
        "Koneksi internet bermasalah. Hubungkan ke internet untuk unduhan pertama Surat ini."
      );
      showToast("Gagal memuat surat, periksa koneksi internet", "error");
    } finally {
      setLoading(false);
      if (scrolltoVerse) {
        setTimeout(() => scrollToVerseElement(scrolltoVerse), 500);
      }
    }
  };

  const scrollToVerseElement = (verseNum: number) => {
    const el = document.getElementById(`verse-box-${verseNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-emerald-500/10");
      setTimeout(() => {
        el.classList.remove("bg-emerald-500/10");
      }, 3000);
    }
  };

  // Bookmark Toggle
  const toggleBookmark = (verseNum: number) => {
    if (!surahDetail) return;
    const item = {
      surahNum: surahDetail.nomor,
      surahName: surahDetail.namaLatin,
      verseNum
    };

    const isExisting = bookmarks.some(
      (b) => b.surahNum === item.surahNum && b.verseNum === item.verseNum
    );

    let updated;
    if (isExisting) {
      updated = bookmarks.filter(
        (b) => !(b.surahNum === item.surahNum && b.verseNum === item.verseNum)
      );
      showToast("Bookmark ayat dihapus", "info");
    } else {
      updated = [...bookmarks, item];
      showToast(`Ayat ${verseNum} disimpan ke Bookmark`, "success");
    }

    setBookmarks(updated);
    localStorage.setItem("mbah_yani_quran_bookmarks", JSON.stringify(updated));
  };

  // Set Last Read
  const saveLastRead = (verseNum: number) => {
    if (!surahDetail) return;
    const item = {
      surahNum: surahDetail.nomor,
      surahName: surahDetail.namaLatin,
      verseNum
    };
    setLastRead(item);
    localStorage.setItem("mbah_yani_quran_last_read", JSON.stringify(item));
    showToast(`Terakhir dibaca disimpan: Surah ${surahDetail.namaLatin} ayat ${verseNum}`, "success");
  };

  // Audio Play controls
  const playVerseAudio = (verse: Verse) => {
    stopAudio();
    // Choose first audio resource from API (usually there are audio file links)
    const audioUrls = Object.values(verse.audio);
    if (audioUrls.length === 0) {
      showToast("Audio ayat ini tidak tersedia.", "error");
      return;
    }
    const url = audioUrls[0] as string; // standard murottal
    audioRef.current = new Audio(url);
    setCurrentPlayingVerse(verse.nomorAyat);
    audioRef.current.play().catch((err) => {
      console.error(err);
      showToast("Gagal memutar audio ayat", "error");
    });
    audioRef.current.onended = () => {
      setCurrentPlayingVerse(null);
    };
  };

  // Play full Surah audio
  const playSurahAudioFull = () => {
    if (!surahDetail) return;
    stopAudio();

    const audioUrls = Object.values(surahDetail.audioFull);
    if (audioUrls.length === 0) {
      showToast("Murottal lengkap untuk Surat ini tidak tersedia.", "error");
      return;
    }
    const url = audioUrls[0] as string;
    audioRef.current = new Audio(url);
    setIsPlayingSurahAudio(true);
    audioRef.current.play().catch((err) => {
      console.error(err);
      showToast("Gagal memutar audio Murottal", "error");
    });
    audioRef.current.onended = () => {
      setIsPlayingSurahAudio(false);
      showToast("Murottal Surat selesai diputar", "success");
    };
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentPlayingVerse(null);
    setIsPlayingSurahAudio(false);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6" id="quran-section">
      {/* Al-Quran List / Main Home View */}
      {activeSurahNum === null ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
              <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              Al-Qur'anul Karim Digital
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm md:text-base">
              Murottal audio lengkap dengan aksara Arab, Latin, dan terjemahan Bahasa Indonesia.
            </p>
          </div>

          {/* Quick Access widgets */}
          {(lastRead || bookmarks.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Last Read widget */}
              {lastRead && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-150 dark:border-emerald-900 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block">
                      LANJUTKAN MEMBACA
                    </span>
                    <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {lastRead.surahName} : Ayat {lastRead.verseNum}
                    </h4>
                  </div>
                  <button
                    onClick={() => loadSurah(lastRead.surahNum, lastRead.verseNum)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg text-xs font-semibold flex items-center gap-1 shadow cursor-pointer transition-colors"
                  >
                    Buka <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Bookmark counts */}
              {bookmarks.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      PENANDA BACAAN
                    </span>
                    <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {bookmarks.length} Ayat ditandai
                    </h4>
                  </div>
                  <div className="flex gap-2 max-w-[180px] overflow-x-auto pb-1">
                    <button
                      onClick={() => {
                        const lastB = bookmarks[bookmarks.length - 1];
                        loadSurah(lastB.surahNum, lastB.verseNum);
                      }}
                      className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:underline shrink-0"
                    >
                      Buka Bookmark Terbaru
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Box */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Cari surat (contoh: Yasin, Al-Mulk, Al-Kahfi...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
            />
          </div>

          {/* Surah Cards Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredSurahs.map((surah) => (
              <div
                key={surah.nomor}
                onClick={() => loadSurah(surah.nomor)}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Surah Number Frame */}
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-400 text-sm font-mono shrink-0">
                    {surah.nomor}
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-slate-800 dark:text-slate-100 text-base leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {surah.namaLatin}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 uppercase tracking-wide font-sans">
                      {surah.tempatTurun} • {surah.jumlahAyat} Ayat
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-arabic font-bold text-emerald-800 dark:text-teal-300 block mb-0.5">
                    {surah.nama}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 italic font-sans block max-w-[100px] truncate leading-tight">
                    {surah.arti}
                  </span>
                </div>
              </div>
            ))}

            {filteredSurahs.length === 0 && (
              <div className="sm:col-span-2 md:col-span-3 text-center py-12 text-slate-500">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p>Surat "{searchQuery}" tidak ditemukan.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Reading Panel (Detail View) */
        <div className="space-y-6">
          {/* Back button & Control bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
            <button
              onClick={() => {
                setActiveSurahNum(null);
                setSurahDetail(null);
                stopAudio();
              }}
              className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 text-sm font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              Kembali Ke Daftar Surat
            </button>

            {/* Reading preferences controls */}
            <div className="flex items-center gap-3">
              {/* Font Sizer */}
              <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-3">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 font-sans hidden sm:inline">Ukuran Arab:</span>
                <input
                  type="range"
                  min="20"
                  max="44"
                  value={arabicFontSize}
                  onChange={(e) => setArabicFontSize(Number(e.target.value))}
                  className="w-20 accent-emerald-600"
                />
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {arabicFontSize}px
                </span>
              </div>

              {/* Toggle controls */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLatin}
                    onChange={(e) => setShowLatin(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  Latin
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => setShowTranslation(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  Terjemah
                </label>
              </div>
            </div>
          </div>

          {/* Loading Animation / Fallback Skeleton */}
          {loading && (
            <div className="space-y-4">
              <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse"></div>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 animate-pulse"
                >
                  <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-8 w-3/4 ml-auto bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-100 dark:border-red-950/50 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="font-semibold text-sm">{error}</p>
              <button
                onClick={() => activeSurahNum && loadSurah(activeSurahNum)}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
              >
                Coba Memuat Ulang
              </button>
            </div>
          )}

          {/* Master Reading container */}
          {surahDetail && (
            <div className="space-y-6">
              {/* Surah Jumbo Header */}
              <div className="bg-gradient-to-br from-emerald-600 to-primary-dark dark:from-emerald-950/60 dark:to-teal-950 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
                <div className="absolute right-[-40px] top-[-40px] text-white/5 font-arabic text-[180px] pointer-events-none select-none">
                  {surahDetail.nama}
                </div>

                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <h3 className="text-3xl font-display font-bold">{surahDetail.namaLatin}</h3>
                  <p className="text-sm text-emerald-100/90 font-sans tracking-wide uppercase">
                    {surahDetail.arti} • {surahDetail.tempatTurun} • {surahDetail.jumlahAyat} AYAT
                  </p>

                  <div className="w-24 h-[1px] bg-emerald-300/40"></div>

                  {/* Basmalah block (omit for Surah 9: At-Taubah) */}
                  {surahDetail.nomor !== 9 && (
                    <span className="text-2xl font-arabic font-bold text-amber-300 py-2 leading-loose">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </span>
                  )}

                  {/* FULL SURAH AUDIO BAR */}
                  <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mt-3 text-sm">
                    <span className="font-medium tracking-wide">Dengarkan Murottal Surat:</span>
                    {isPlayingSurahAudio ? (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                        <button
                          onClick={stopAudio}
                          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Square className="w-4 h-4 fill-amber-400" /> Hentikan
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={playSurahAudioFull}
                        className="text-emerald-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-emerald-300" /> Putar Quran
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Verses List */}
              <div className="space-y-4">
                {surahDetail.ayat.map((verse) => {
                  const isVersePlaying = currentPlayingVerse === verse.nomorAyat;
                  const isAnnotated = bookmarks.some(
                    (b) => b.surahNum === surahDetail.nomor && b.verseNum === verse.nomorAyat
                  );

                  return (
                    <div
                      key={verse.nomorAyat}
                      id={`verse-box-${verse.nomorAyat}`}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 md:p-6 rounded-2xl shadow-sm space-y-4 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                    >
                      {/* Verse Control Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        {/* Star emblem with Verse Number */}
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 flex items-center justify-center font-bold text-[11px] font-mono text-emerald-800 dark:text-emerald-400 shrink-0">
                            {/* Decorative Star background */}
                            <svg className="absolute inset-0 w-full h-full text-emerald-100 dark:text-emerald-950/80" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0l3.05 6.18h6.81l-4.93 4.81L18.09 18l-6.09-3.21L5.91 18l1.16-7.01L2.14 6.18h6.81z" />
                            </svg>
                            <span className="z-10">{verse.nomorAyat}</span>
                          </div>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-sans">
                            Surat {surahDetail.namaLatin} • Ayat {verse.nomorAyat}
                          </span>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => playVerseAudio(verse)}
                            title="Putar Audio"
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isVersePlaying
                                ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-900"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:text-emerald-600 dark:bg-slate-800 dark:border-slate-700"
                            }`}
                          >
                            <Volume2 className={`w-4 h-4 ${isVersePlaying ? "animate-bounce" : ""}`} />
                          </button>

                          <button
                            onClick={() => toggleBookmark(verse.nomorAyat)}
                            title="Tandai Bookmark"
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isAnnotated
                                ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900"
                                : "bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 dark:bg-slate-800 dark:border-slate-700"
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isAnnotated ? "fill-amber-400" : ""}`} />
                          </button>

                          <button
                            onClick={() => saveLastRead(verse.nomorAyat)}
                            title="Simpan Terakhir Dibaca"
                            className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500 hover:text-emerald-600 p-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Set Last Read</span>
                          </button>
                        </div>
                      </div>

                      {/* Arabic Verse Scripture (Right aligned, custom font scaling) */}
                      <div className="text-right py-2 leading-relaxed tracking-wide font-arabic">
                        <span
                          className="block text-emerald-950 dark:text-teal-50"
                          style={{
                            fontSize: `${arabicFontSize}px`,
                            lineHeight: `${arabicFontSize * 1.8}px`
                          }}
                        >
                          {verse.teksArab}
                        </span>
                      </div>

                      {/* Latin Transliteration Description */}
                      {showLatin && (
                        <p className="text-sm text-slate-500 dark:text-emerald-500/80 italic font-medium leading-relaxed font-sans mt-2">
                          {verse.teksLatin}
                        </p>
                      )}

                      {/* Indonesian Translation Description */}
                      {showTranslation && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-normal leading-relaxed font-sans">
                          {verse.teksIndonesia}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
