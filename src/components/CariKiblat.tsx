import React, { useState, useEffect } from "react";
import { Compass, Navigation, MapPin, Info, RefreshCw, AlertCircle } from "lucide-react";
import { calculateQiblaDirection, INDONESIAN_CITIES, CityPreset } from "../utils/islamicUtils";
import { motion } from "motion/react";

interface CariKiblatProps {
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

export default function CariKiblat({ showToast }: CariKiblatProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>({ lat: -6.2088, lng: 106.8456 }); // Defaults to Jakarta
  const [selectedCity, setSelectedCity] = useState<string>("Jakarta");
  const [qiblaAngle, setQiblaAngle] = useState<number>(295.14); // True bearing to Kaaba from coordinates
  const [heading, setHeading] = useState<number>(0); // Current compass direction user is facing (0 is N)
  const [isGPSUsed, setIsGPSUsed] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isListeningHeading, setIsListeningHeading] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  // Calculate direction when coordinates change
  useEffect(() => {
    if (coords) {
      const angle = calculateQiblaDirection(coords.lat, coords.lng);
      setQiblaAngle(angle);
    }
  }, [coords]);

  // Request browser GPS position
  const getGPSLocation = () => {
    setGpsLoading(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation tidak didukung oleh browser Anda.");
      setGpsLoading(false);
      showToast("GPS tidak didukung oleh browser", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });
        setIsGPSUsed(true);
        setSelectedCity("GPS Kustom");
        setGpsLoading(false);
        showToast("Lokasi GPS berhasil didapatkan!", "success");
      },
      (error) => {
        let msg = "Gagal mengambil lokasi GPS.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Izin lokasi ditolak keluarga Mbah Yani.";
        }
        setGpsError(msg);
        setGpsLoading(false);
        showToast(msg, "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Listen to device orientation (compass sensor on mobiles)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // absolute heading is preferred (webkitCompassHeading is iOS specific, alpha is Android standard)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const webkitHeading = (e as any).webkitCompassHeading;
      if (webkitHeading !== undefined) {
        setHeading(webkitHeading);
        setIsListeningHeading(true);
      } else if (e.alpha !== null && e.absolute) {
        // alpha measures counterclockwise 0 to 360, compass is clockwise, so:
        setHeading((360 - e.alpha) % 360);
        setIsListeningHeading(true);
      }
    };

    // On iOS 13+ devices, we must request orientation permission explicitly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestPermission = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const res = await (DeviceOrientationEvent as any).requestPermission();
          if (res === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, true);
          }
        } catch (err) {
          console.error("Compass permission request failed:", err);
        }
      } else {
        window.addEventListener("deviceorientationabsolute", handleOrientation, true);
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  // Handle preset city change
  const handleCityPresetChange = (cityName: string) => {
    const city = INDONESIAN_CITIES.find((c) => c.nama === cityName);
    if (city) {
      setCoords({ lat: city.lat, lng: city.lng });
      setSelectedCity(city.nama);
      setIsGPSUsed(false);
      setGpsError(null);
      showToast(`Lokasi diubah ke kota ${city.nama}`, "info");
    }
  };

  // Rotate manually utility (compass simulator as fallback)
  const adjustHeadingManually = (offset: number) => {
    setHeading((prev) => (prev + offset + 360) % 360);
    if (!isListeningHeading) {
      showToast("Kompas disimulasikan. Putar ke arah Kaabah!", "info");
    }
  };

  // Determine alignment accuracy
  // Qibla needle relative angle to user heading
  const relativeQiblaAngle = (qiblaAngle - heading + 360) % 360;
  const isAligned = Math.abs(relativeQiblaAngle) < 3.5 || Math.abs(relativeQiblaAngle - 360) < 3.5;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" id="kiblat-section">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
          <Navigation className="w-8 h-8 text-emerald-600 dark:text-emerald-400 rotate-45" />
          Cari Arah Kiblat
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm md:text-base">
          Tentukan kiblat solat dari lokasi Mbah Yani sekeluarga secara akurat.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Left Side Controls */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Pilih Wilayah Domisili
            </label>
            <div className="flex gap-2">
              <select
                value={isGPSUsed ? "GPS Kustom" : selectedCity}
                onChange={(e) => handleCityPresetChange(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {isGPSUsed && <option value="GPS Kustom">📍 Lokasi GPS Saya</option>}
                {INDONESIAN_CITIES.map((city) => (
                  <option key={city.nama} value={city.nama}>
                    {city.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={getGPSLocation}
              disabled={gpsLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-100" />
              {gpsLoading ? "Mengambil GPS..." : "Deteksi Otomatis Lokasi GPS"}
            </button>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              *Atau gunakan tombol di bawah untuk simulasi di komputer
            </p>
          </div>

          {/* Fallback Simulator buttons */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              Kontrol Putar Kompas (Simulasi)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => adjustHeadingManually(-15)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                ⬅ Putar Kiri 15°
              </button>
              <button
                onClick={() => adjustHeadingManually(15)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Putar Kanan 15° ➡
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="space-y-3 text-xs md:text-sm border-t border-slate-100 dark:border-slate-800 pt-4 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Derajat Kiblat Kaabah:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {qiblaAngle}° Utas
              </span>
            </div>
            <div className="flex justify-between">
              <span>Orientasi Anda Saat Ini:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {heading.toFixed(1)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span>Lintang (Latitude):</span>
              <span className="font-mono">{coords?.lat.toFixed(5)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bujur (Longitude):</span>
              <span className="font-mono">{coords?.lng.toFixed(5)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Status Kompas:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  isListeningHeading
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-800 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {isListeningHeading ? "Sensor Aktif" : "Mode Simulasi"}
              </span>
            </div>
          </div>

          {gpsError && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-950/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Right Side Visual Compass Display */}
        <div className="md:col-span-12 lg:md:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-md border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-6 min-h-[420px]">
          {/* Compass Alignment Alert Card */}
          <div
            className={`w-full max-w-sm rounded-2xl py-3 px-4 text-center border transition-all text-sm font-display font-semibold flex items-center justify-center gap-2 ${
              isAligned
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 ring-4 ring-emerald-500/10 compass-glow"
                : "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 text-slate-500"
            }`}
          >
            {isAligned ? (
              <>
                <Compass className="w-5 h-5 text-emerald-500 animate-spin" />
                <span>SEHADAP KIBLAT (ALIGNED)!</span>
              </>
            ) : (
              <>
                <Info className="w-5 h-5 text-slate-400" />
                <span>Putar Kompas untuk Mencapai {qiblaAngle}°</span>
              </>
            )}
          </div>

          {/* The Circular Compass Container */}
          <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
            {/* Outermost Ring: Degree measurements */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-200/50 dark:border-slate-800 flex items-center justify-center">
              <span className="absolute top-1 text-[10px] font-mono font-bold text-red-500">U (North)</span>
              <span className="absolute right-2 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">T (East)</span>
              <span className="absolute bottom-1 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">S (South)</span>
              <span className="absolute left-2 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">B (West)</span>
            </div>

            {/* Inner Rotating compass card with degree ticks */}
            <div
              className="absolute w-[92%] h-[92%] rounded-full border border-slate-300 dark:border-slate-700 shadow-inner flex items-center justify-center transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${-heading}deg)` }}
            >
              {/* Markers & ticks */}
              <div className="absolute inset-1 rounded-full border border-dotted border-slate-200 dark:border-slate-800/80"></div>
              
              {/* Cardinal angle markers */}
              <div className="absolute top-3 text-[10px] text-slate-400">0°</div>
              <div className="absolute right-3.5 text-[10px] text-slate-400">90°</div>
              <div className="absolute bottom-3 text-[10px] text-slate-400">180°</div>
              <div className="absolute left-3.5 text-[10px] text-slate-400">270°</div>

              {/* Kaaba Direction Indicator line & marker */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-start pointer-events-none"
                style={{ transform: `rotate(${qiblaAngle}deg)` }}
              >
                {/* Visual marker of Kaaba */}
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs mt-4 shadow-lg border-2 border-white ring-2 ring-amber-500/30">
                  🕋
                </div>
                {/* Dotted green line from center to Qibla */}
                <div className="w-0.5 h-16 border-l-2 border-dashed border-amber-500"></div>
                <div className="text-[9px] font-display font-bold text-amber-600 dark:text-amber-400 tracking-wider">KIBLAT</div>
              </div>
            </div>

            {/* Needle and Jewel Pivot representing current Facing heading */}
            <div className="absolute w-12 h-12 flex items-center justify-center z-10">
              {/* Modern elegant compass pivot */}
              <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white shadow-md z-20 dark:bg-emerald-500"></div>
              {/* Magnetic pointer needle towards Kaaba relative angle */}
              <div
                className="absolute w-1 h-36 bottom-[50%] left-[50%] -translate-x-[2px] origin-bottom transition-transform duration-300 pointer-events-none"
                style={{
                  transform: `rotate(${relativeQiblaAngle}deg)`,
                  height: "110px",
                  bottom: "50%"
                }}
              >
                {/* Pointer tip */}
                <div className="absolute top-0 left-[-4px] w-3 h-4 bg-emerald-600 border-l-[6px] border-r-[6px] border-b-[16px] border-l-transparent border-r-transparent border-b-emerald-500 dark:border-b-amber-400"></div>
                {/* Pointer line */}
                <div className="absolute top-[12px] left-[1px] w-[2px] h-[98px] bg-gradient-to-b from-emerald-500 to-transparent"></div>
              </div>
            </div>

            {/* Soft pulse effect on alignment */}
            {isAligned && (
              <div className="absolute inset-2 bg-emerald-500/5 rounded-full animate-ping pointer-events-none"></div>
            )}
          </div>

          <div className="text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 block mb-1">
              Sudut Kemiringan Arah Kiblat
            </span>
            <span className="text-4xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-baseline justify-center gap-1 font-mono">
              {relativeQiblaAngle.toFixed(1)}
              <span className="text-emerald-600 dark:text-emerald-400 text-lg">°</span>
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-xs mx-auto">
              {isListeningHeading
                ? "Putar Ponsel Anda terus sampai indikator di atas menyala HIJAU & SEHADAP KIBLAT."
                : "Gunakan kontrol kompas atau putar simulasi agar nilai di atas mendekati 0°."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
