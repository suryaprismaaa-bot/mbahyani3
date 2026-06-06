import React, { useState, useEffect } from "react";
import { BookMarked, Search, Copy, Share2, Star, Check, Sparkles, Send } from "lucide-react";
import { doaData } from "../data/doa";
import { Doa } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DoaHarianProps {
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

const CATEGORIES = ["Semua", "Tidur", "Rumah", "Makan", "Perjalanan", "Masjid"];

export default function DoaHarian({ showToast }: DoaHarianProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem("mbah_yani_doa_favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (id: string) => {
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter((f) => f !== id);
      showToast("Dihapus dari doa favorit", "info");
    } else {
      updated = [...favorites, id];
      showToast("Ditambahkan ke doa favorit!", "success");
    }
    setFavorites(updated);
    localStorage.setItem("mbah_yani_doa_favorites", JSON.stringify(updated));
  };

  // Copy to Clipboard
  const copyDoaToClipboard = (doa: Doa) => {
    const textToCopy = `🕌 *${doa.judul}* 🕌\n\n*Arab:*\n${doa.arab}\n\n*Latin:*\n_${doa.latin}_\n\n*Terjemahan:*\n"${doa.terjemahan}"\n\n--- \n_Dikutip dari Portal Islami Keluarga Mbah Yani_`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(doa.id);
    showToast(`${doa.judul} berhasil disalin!`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Share via WhatsApp
  const shareToWhatsapp = (doa: Doa) => {
    const textToShare = `🕌 *${doa.judul}* 🕌\n\n*Arab:*\n${doa.arab}\n\n*Latin:*\n_${doa.latin}_\n\n*Terjemahan:*\n"${doa.terjemahan}"\n\n_Portal Islami Keluarga Mbah Yani_`;
    const encoded = encodeURIComponent(textToShare);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, "_blank");
    showToast("Membuka WhatsApp untuk berbagi...", "info");
  };

  // Filter Doa list
  const filteredDoa = doaData.filter((d) => {
    const matchesSearch =
      d.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.terjemahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.latin.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" || d.kategori === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" id="doa-section">
      {/* Decorative Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
          <BookMarked className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          Doa Sehari-hari
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm md:text-base">
          Kumpulan doa pilihan harian lengkap dengan teks Arab, Latin, dan terjemahan.
        </p>
      </div>

      <div className="space-y-6">
        {/* Search and Categories bar */}
        <div className="space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Cari doa harian (contoh: makan, tidur, keluar rumah...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Categories Pill tags */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Doa Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDoa.map((doa) => {
              const isFav = favorites.includes(doa.id);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={doa.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 group"
                >
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                          {doa.kategori}
                        </span>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(doa.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isFav
                            ? "bg-amber-50 border-amber-100 text-amber-500 dark:bg-amber-950/35 dark:border-amber-900"
                            : "bg-slate-50 border-slate-150 text-slate-400 dark:bg-slate-800 dark:border-slate-800 hover:text-amber-500"
                        }`}
                        title={isFav ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                      >
                        <Star className={`w-4 h-4 ${isFav ? "fill-amber-400 text-amber-500" : ""}`} />
                      </button>
                    </div>

                    {/* Prayer Title */}
                    <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-lg leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {doa.judul}
                    </h3>

                    {/* Arabic text with beautiful ligatures */}
                    <div className="text-right py-3 leading-relaxed tracking-wide font-arabic">
                      <span className="text-2xl text-emerald-950 dark:text-teal-100 font-bold block mb-1">
                        {doa.arab}
                      </span>
                    </div>

                    {/* Latin transliteration */}
                    <p className="text-sm text-slate-500 dark:text-emerald-500/80 italic font-medium font-sans">
                      {doa.latin}
                    </p>

                    {/* Indonesian translation */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                      {doa.terjemahan}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-1">
                    <button
                      onClick={() => copyDoaToClipboard(doa)}
                      className="flex-1 bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 hover:bg-slate-100 hover:text-slate-900 text-slate-600 dark:text-slate-300 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedId === doa.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => shareToWhatsapp(doa)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Bagikan WA</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredDoa.length === 0 && (
            <div className="sm:col-span-2 text-center py-12 text-slate-500">
              <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p>Doa "{searchQuery}" tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
