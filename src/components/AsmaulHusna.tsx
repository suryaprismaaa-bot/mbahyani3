import React, { useState } from "react";
import { Sparkles, Search, Compass, Info, Heart, Star, CheckCircle } from "lucide-react";
import { asmaulHusnaData } from "../data/asmaulHusna";
import { AsmaulHusnaItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AsmaulHusnaProps {
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

export default function AsmaulHusna({ showToast }: AsmaulHusnaProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<AsmaulHusnaItem | null>(null);
  const [memorizedList, setMemorizedList] = useState<number[]>([]);

  // Load memorized names on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("mbah_yani_asmaul_memorized");
    if (saved) {
      setMemorizedList(JSON.parse(saved));
    }
  }, []);

  const toggleMemorized = (urutan: number, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click triggers
    let updated;
    if (memorizedList.includes(urutan)) {
      updated = memorizedList.filter((n) => n !== urutan);
      showToast("Tanda hafalan dimatikan", "info");
    } else {
      updated = [...memorizedList, urutan];
      showToast(`Masyallah! Menandai hafalan ke-${urutan}`, "success");
    }
    setMemorizedList(updated);
    localStorage.setItem("mbah_yani_asmaul_memorized", JSON.stringify(updated));
  };

  // Filter 99 Names
  const filteredNames = asmaulHusnaData.filter((item) => {
    return (
      item.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.arti.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.arab.includes(searchQuery)
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6" id="asmaul-section">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          Asmaul Husna
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm md:text-base">
          Merenung dan menghafalkan 99 Nama Baik Allah SWT untuk ketenangan jiwa keluarga.
        </p>
      </div>

      {/* Progress Tracker Card */}
      {memorizedList.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/60 p-4 rounded-2xl mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="space-y-1">
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-200">
              Target Hafalan Asmaul Husna Keluarga
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masyallah, keluarga Mbah Yani telah menghafal{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm">
                {memorizedList.length}
              </strong>{" "}
              dari 99 Nama Allah!
            </p>
          </div>
          {/* Progress bar */}
          <div className="flex-1 sm:max-w-xs flex items-center gap-2">
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(memorizedList.length / 99) * 100}%` }}
              ></div>
            </div>
            <span className="font-mono font-bold text-xs shrink-0 text-slate-600 dark:text-slate-300">
              {Math.round((memorizedList.length / 99) * 100)}%
            </span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Search widget */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Cari nama Allah (contoh: Ar-Rahman, Al-Malik, Yang Maha Pengasih...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* 99 Names Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredNames.map((item) => {
            const isMemorized = memorizedList.includes(item.urutan);
            return (
              <div
                key={item.urutan}
                onClick={() => setSelectedItem(item)}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer flex flex-col justify-between text-center min-h-[140px] relative group"
              >
                {/* Score Number Badge & Memorized Mark */}
                <div className="flex justify-between items-center w-full z-10">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    #{item.urutan.toString().padStart(2, "0")}
                  </span>

                  <button
                    onClick={(e) => toggleMemorized(item.urutan, e)}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      isMemorized
                        ? "text-emerald-600 dark:text-emerald-400 scale-110"
                        : "text-slate-300 hover:text-emerald-500 dark:text-slate-700"
                    }`}
                    title={isMemorized ? "Tandai Belum Hafal" : "Tandai Hafal!"}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${isMemorized ? "fill-emerald-500/10" : ""}`} />
                  </button>
                </div>

                {/* Big Arabic Text */}
                <span className="text-2xl font-arabic font-extrabold text-emerald-800 dark:text-teal-300 my-1 group-hover:scale-105 transition-transform duration-300">
                  {item.arab}
                </span>

                {/* Details */}
                <div className="space-y-0.5 mt-1 border-t border-slate-50 dark:border-slate-800/60 pt-1.5">
                  <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {item.latin}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight line-clamp-1 italic">
                    {item.arti}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredNames.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p>Asmaul Husna "{searchQuery}" tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Focus Expanded Modal Block */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center relative shadow-2xl space-y-6"
            >
              {/* Close Button top corner */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-2">
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-extrabold block">
                  NAMA ALLAH KE-{selectedItem.urutan}
                </span>
                <div className="text-4xl font-arabic font-extrabold text-emerald-800 dark:text-teal-300 pt-3">
                  {selectedItem.arab}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-slate-850 dark:text-slate-100 text-xl">
                  {selectedItem.latin}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm italic font-sans px-4">
                  "{selectedItem.arti}"
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-550 dark:text-slate-400 font-sans leading-relaxed text-left">
                <strong>Penjelasan Makna:</strong> Merupakan salah satu asma agung Allah SWT yang menyiratkan sifat keesaan-Nya yang mutlak. Membaca dan mengimani nama <em>{selectedItem.latin}</em> mendatangkan kedamaian, keberkahan bagi rezeki, dan perlindungan Allah dari segala mudharat di dunia dan akhirat.
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Masyallah, Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
