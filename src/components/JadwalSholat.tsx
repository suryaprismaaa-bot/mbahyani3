import React, { useState, useEffect } from "react";
import { Clock, MapPin, Map, RefreshCw, Star, Info, AlertCircle } from "lucide-react";
import { calculatePrayerTimes, getNextPrayerCountdown, INDONESIAN_CITIES, CityPreset } from "../utils/islamicUtils";
import { PrayerTime } from "../types";
import { motion } from "motion/react";

interface JadwalSholatProps {
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

// Convert a Gregorian date to Islamic Hijri Date approximation (Kuwaiti algorithm style)
export function getHijriDate(date: Date): string {
  // basic lunar crescent approximation
  let jd = date.getTime() / 86400000 + 2440587.5;
  let l = Math.floor(jd - 1948439.5);
  let n = Math.floor((l - 122.1) / 365.25);
  let jdCalculated = Math.floor(365.25 * n);
  let monthCalculated = Math.floor((l - jdCalculated) / 30.6001);
  let d = l - jdCalculated - Math.floor(30.6001 * monthCalculated);
  
  // Hijri adjustment
  let epoch = jd - 1948085;
  let cyc = Math.floor(epoch / 10631);
  epoch = epoch - 10631 * cyc;
  let yr = Math.floor((epoch * 30 + 10629) / 10631);
  epoch = epoch - Math.floor((yr * 10631 + 29) / 30);
  let mn = Math.floor((epoch * 24 + 24) / 709);
  let day = epoch - Math.floor((mn * 709 + 24) / 24) + 1;
  let year = cyc * 30 + yr + 1;

  const monthNames = [
    "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
    "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
    "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"
  ];

  return `${day} ${monthNames[mn]} ${year} H`;
}

export default function JadwalSholat({ showToast }: JadwalSholatProps) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isGPSUsed, setIsGPSUsed] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("Jakarta");
  
  // Coordinate coordinates (Defaults to Jakarta)
  const [coords, setCoords] = useState<{ lat: number; lng: number; timezone: number }>({
    lat: -6.2088,
    lng: 106.8456,
    timezone: 7
  });

  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdownData, setCountdownData] = useState<{ name: string; countdown: string; progress: number } | null>(null);

  // Update Clock seconds every 1-second interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Recalculate prayer times when coordinates or selected date changes
  useEffect(() => {
    const times = calculatePrayerTimes(coords.lat, coords.lng, coords.timezone, currentTime);
    setPrayerTimes(times);
  }, [coords, currentTime.getDate()]); // recalculate when day changes or location shifts

  // Recalculate countdown ticker every second
  useEffect(() => {
    if (prayerTimes) {
      const liveData = getNextPrayerCountdown(prayerTimes, currentTime);
      setCountdownData(liveData);
    }
  }, [prayerTimes, currentTime]);

  const handleCityChange = (cityName: string) => {
    const city = INDONESIAN_CITIES.find((c) => c.nama === cityName);
    if (city) {
      setCoords({ lat: city.lat, lng: city.lng, timezone: city.timezone });
      setSelectedCity(city.nama);
      setIsGPSUsed(false);
      setGpsError(null);
      showToast(`Jadwal sholat disesuaikan untuk kota ${city.nama}`, "info");
    }
  };

  const getGPSLocation = () => {
    setGpsLoading(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation tidak didukung oleh browser ini.");
      setGpsLoading(false);
      showToast("GPS tidak didukung oleh browser", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Form timezone approximation based on standard Indonesian timezone boundaries
        // WIB (UTC+7) is < 115° E, WITA (UTC+8) is < 135° E, WIT (UTC+9) is >= 135° E
        let tz = 7;
        if (userLng >= 115 && userLng < 135) {
          tz = 8;
        } else if (userLng >= 135) {
          tz = 9;
        }

        setCoords({ lat: userLat, lng: userLng, timezone: tz });
        setIsGPSUsed(true);
        setSelectedCity("GPS Kustom");
        setGpsLoading(false);
        showToast("Lokasi koordinat GPS berhasil dipetakan!", "success");
      },
      (error) => {
        let msg = "Gagal mengambil kordinat GPS otomatis.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Akses lokasi ditolak. Gunakan filter Kota di bawah.";
        }
        setGpsError(msg);
        setGpsLoading(false);
        showToast(msg, "error");
      },
      { timeout: 8000 }
    );
  };

  const getGregorianString = (date: Date): string => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const PRETTY_LABELS: Record<string, string> = {
    imsak: "Imsak / Sahur",
    subuh: "Subuh Salat",
    terbit: "Syuruk (Terbit)",
    dzuhur: "Dzuhur Salat",
    ashar: "Ashar Salat",
    maghrib: "Maghrib Salat",
    isya: "Isya Salat"
  };

  const SCHEDULE_KEYS = ["imsak", "subuh", "terbit", "dzuhur", "ashar", "maghrib", "isya"] as const;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" id="sholat-section">
      {/* Visual Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
          <Clock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          Jadwal Sholat Harian
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm md:text-base">
          Waktu imsakiah harian akurat berdasar sensor GPS atau pilihan kota di Indonesia.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Countdown and DateTime display */}
        <div className="md:col-span-12 lg:col-span-5 hero-gradient rounded-3xl p-6 shadow-md text-white flex flex-col justify-between gap-6 min-h-[360px] relative overflow-hidden border border-emerald-500/10">
          {/* Calendar top info */}
          <div className="space-y-1.5 z-10">
            <span className="text-[10px] bg-white/15 px-2.5 py-1 rounded-full text-white font-bold tracking-wider uppercase inline-block">
              WAKTU HARI INI
            </span>
            <h4 className="text-lg font-bold font-display leading-tight">
              {getGregorianString(currentTime)}
            </h4>
            <p className="text-xs text-emerald-100 font-medium">
              Hijriyah: <span className="font-semibold text-[#D4AF37]">{getHijriDate(currentTime)}</span>
            </p>
          </div>

          {/* Large Countdown center widget */}
          {countdownData && (
            <div className="text-center py-4 z-10 my-auto">
              <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-100/75 block">
                Mendekati Waktu Shalat
              </span>
              <h2 className="text-4xl font-display font-bold text-[#D4AF37] mt-1">
                {countdownData.name}
              </h2>

              {/* Ticking Seconds digital screen */}
              <div className="bg-black/15 backdrop-blur-md rounded-2xl py-3 px-5 inline-block font-mono text-xl tracking-tight font-bold mt-3 border border-white/5 shadow-inner">
                {countdownData.countdown}
              </div>

              {/* Graphical Progress Bar */}
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-accent-gold h-full rounded-full transition-all duration-1000"
                  style={{ width: `${countdownData.progress}%`, backgroundColor: '#D4AF37' }}
                ></div>
              </div>
            </div>
          )}

          {/* Interactive footer: active GPS/city indicators */}
          <div className="z-10 bg-black/15 p-3 rounded-2xl flex items-center justify-between text-xs border border-white/5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Kawasan: <strong>{selectedCity}</strong></span>
            </span>
            <span className="font-mono text-[10px] text-emerald-100/90">
              UTC +0{coords.timezone}
            </span>
          </div>

          {/* Soft background geometric watermark */}
          <div className="absolute right-[-20%] bottom-[-10%] text-white/5 font-bold font-arabic text-[150px] select-none pointer-events-none">
            صلاة
          </div>
        </div>

        {/* Right Side: Detailed prayer schedule times list */}
        <div className="md:col-span-12 lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-5">
          
          {/* Location adjustment switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex-1">
              <select
                value={isGPSUsed ? "GPS Kustom" : selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {isGPSUsed && <option value="GPS Kustom">📍 Lokasi GPS Saya</option>}
                {INDONESIAN_CITIES.map((c) => (
                  <option key={c.nama} value={c.nama}>
                    {c.nama}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={getGPSLocation}
              disabled={gpsLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
              <span>{gpsLoading ? "Mencari GPS..." : "GPS Saya"}</span>
            </button>
          </div>

          {gpsError && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-950/50">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* List of Prayer Times */}
          {prayerTimes && (
            <div className="space-y-2">
              {SCHEDULE_KEYS.map((key) => {
                const isNext = countdownData?.name.toLowerCase() === key;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isNext
                        ? "bg-emerald-500/10 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/5 sholat-card"
                        : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800/50 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isNext ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-800"></div>
                      )}
                      <span
                        className={`text-sm ${
                          isNext
                            ? "font-bold text-emerald-800 dark:text-emerald-400"
                            : "font-medium text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {PRETTY_LABELS[key]}
                      </span>
                    </div>

                    <span
                      className={`font-mono text-base font-bold ${
                        isNext
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {prayerTimes[key]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
