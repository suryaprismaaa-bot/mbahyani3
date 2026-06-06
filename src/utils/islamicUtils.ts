import { PrayerTime } from "../types";

// Coordinates of Kaaba in Makkah
export const KAABA_LAT = 21.422487;
export const KAABA_LNG = 39.826206;

export interface CityPreset {
  nama: string;
  lat: number;
  lng: number;
  timezone: number; // UTC offset in hours
}

export const INDONESIAN_CITIES: CityPreset[] = [
  { nama: "Jakarta", lat: -6.2088, lng: 106.8456, timezone: 7 },
  { nama: "Surabaya", lat: -7.2575, lng: 112.7521, timezone: 7 },
  { nama: "Bandung", lat: -6.9175, lng: 107.6191, timezone: 7 },
  { nama: "Medan", lat: 3.5952, lng: 98.6722, timezone: 7 },
  { nama: "Semarang", lat: -6.9667, lng: 110.4167, timezone: 7 },
  { nama: "Makassar", lat: -5.1477, lng: 119.4327, timezone: 8 },
  { nama: "Palembang", lat: -2.9761, lng: 104.7754, timezone: 7 },
  { nama: "Yogyakarta", lat: -7.7956, lng: 110.3695, timezone: 7 },
  { nama: "Denpasar", lat: -8.6705, lng: 115.2126, timezone: 8 },
  { nama: "Balikpapan", lat: -1.2654, lng: 116.8312, timezone: 8 },
  { nama: "Banjarmasin", lat: -3.3167, lng: 114.5900, timezone: 8 },
  { nama: "Pontianak", lat: -0.0263, lng: 109.3425, timezone: 7 },
  { nama: "Padang", lat: -0.9471, lng: 100.4172, timezone: 7 },
  { nama: "Samarinda", lat: -0.5022, lng: 117.1536, timezone: 8 },
  { nama: "Banda Aceh", lat: 5.5611, lng: 95.3194, timezone: 7 },
  { nama: "Manado", lat: 1.4748, lng: 124.8409, timezone: 8 },
  { nama: "Kupang", lat: -10.1772, lng: 123.6070, timezone: 8 },
  { nama: "Ambon", lat: -3.6547, lng: 128.1906, timezone: 9 },
  { nama: "Jayapura", lat: -2.5916, lng: 140.7181, timezone: 9 },
  { nama: "Solo (Surakarta)", lat: -7.5667, lng: 110.8167, timezone: 7 },
  { nama: "Malang", lat: -7.9797, lng: 112.6304, timezone: 7 },
  { nama: "Cirebon", lat: -6.7216, lng: 108.5560, timezone: 7 }
];

// Calculate Qibla bearing from user coordinates
export function calculateQiblaDirection(lat: number, lng: number): number {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const kaabaLatRad = (KAABA_LAT * Math.PI) / 180;
  const kaabaLngRad = (KAABA_LNG * Math.PI) / 180;

  const y = Math.sin(kaabaLngRad - lngRad);
  const x =
    Math.cos(latRad) * Math.tan(kaabaLatRad) -
    Math.sin(latRad) * Math.cos(kaabaLngRad - lngRad);

  const qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;
  qiblaDeg = (qiblaDeg + 360) % 360;

  return Number(qiblaDeg.toFixed(2));
}

// Basic trigonometric helpers for degree-based operations
function dSin(d: number) {
  return Math.sin((d * Math.PI) / 180);
}
function dCos(d: number) {
  return Math.cos((d * Math.PI) / 180);
}
function dTan(d: number) {
  return Math.tan((d * Math.PI) / 180);
}
function dAsin(x: number) {
  return (Math.asin(x) * 180) / Math.PI;
}
function dAcos(x: number) {
  return (Math.acos(x) * 180) / Math.PI;
}
function dAtan2(y: number, x: number) {
  return (Math.atan2(y, x) * 180) / Math.PI;
}

// Convert hours decimal back to "HH:MM" string
export function formatTime24(decimalHour: number): string {
  if (isNaN(decimalHour) || decimalHour < 0 || decimalHour >= 24) {
    return "--:--";
  }
  const adjusted = (decimalHour + 24) % 24;
  const hours = Math.floor(adjusted);
  const minutes = Math.round((adjusted - hours) * 60);
  
  let finalHours = hours;
  let finalMinutes = minutes;
  if (minutes === 60) {
    finalHours = (hours + 1) % 24;
    finalMinutes = 0;
  }

  const hStr = finalHours.toString().padStart(2, "0");
  const mStr = finalMinutes.toString().padStart(2, "0");
  return `${hStr}:${mStr}`;
}

// Calculates prayer times offline using standard formulas (Meeus Astronomical Algorithms / PrayTimes.org style)
export function calculatePrayerTimes(
  lat: number,
  lng: number,
  timezone: number,
  date: Date
): PrayerTime {
  // Get Julian Date
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Helper calculation
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Days since epoch
  const d = jd - 2451545.0;

  // Mean anomaly of the sun
  const g = (357.529 + 0.98560028 * d) % 360;
  // Mean longitude of the sun
  const q = (280.459 + 0.98564736 * d) % 360;
  // Geocentric apparent ecliptic longitude
  const L = (q + 1.915 * dSin(g) + 0.02 * dSin(2 * g)) % 360;

  // Mean obliquity of the ecliptic
  const e = 23.439 - 0.00000036 * d;

  // Declination
  const declination = dAsin(dSin(e) * dSin(L));

  // Equation of Time (in degrees)
  const RA = dAtan2(dCos(e) * dSin(L), dCos(L)) / 15;
  const EqTime = q / 15 - RA; // hours

  // Solar Transit / Midday (Dzuhur) in UTC
  const baseTransit = 12 - EqTime;
  const transitLocal = baseTransit + timezone - lng / 15;

  // Calculate Sun altitude limits according to Indonesian Kemenag (Subuh: -20, Isya: -18)
  const subuhAngle = -20;
  const isyaAngle = -18;
  const sunriseAngle = -0.833; // including refraction and solar center correction

  // Helper hour angle calculator
  const calcHourAngle = (angle: number): number => {
    const val =
      (dSin(angle) - dSin(lat) * dSin(declination)) /
      (dCos(lat) * dCos(declination));
    if (val > 1 || val < -1) return NaN; // Never reaches altitude
    return dAcos(val) / 15; // in hours
  };

  const sunriseHA = calcHourAngle(sunriseAngle);
  
  // Dzuhur
  const dzuhurHour = transitLocal + 4 / 60; // 4 minutes safety addition

  // Subuh
  const subuhHA = calcHourAngle(subuhAngle);
  const subuhHour = isNaN(subuhHA) ? NaN : transitLocal - subuhHA;

  // Syuruk (Sunrise)
  const sunriseHour = isNaN(sunriseHA) ? NaN : transitLocal - sunriseHA;

  // Ashar (Standard shadow method where shadow ratio = 1)
  const asharAlt = dAtan2(1, 1 + Math.abs(dTan(lat - declination)));
  const asharHA = calcHourAngle(asharAlt);
  const asharHour = isNaN(asharHA) ? NaN : transitLocal + asharHA;

  // Maghrib
  const maghribHour = isNaN(sunriseHA) ? NaN : transitLocal + sunriseHA + 2 / 60; // 2 min buffer

  // Isya
  const isyaHA = calcHourAngle(isyaAngle);
  const isyaHour = isNaN(isyaHA) ? NaN : transitLocal + isyaHA + 2 / 60;

  // Imsak - 10 minutes before Subuh
  const imsakHour = isNaN(subuhHour) ? NaN : subuhHour - 10 / 60;

  const padZero = (n: number) => n.toString().padStart(2, "0");
  const tStr = `${year}-${padZero(month)}-${padZero(day)}`;

  return {
    imsak: formatTime24(imsakHour),
    subuh: formatTime24(subuhHour),
    terbit: formatTime24(sunriseHour),
    dzuhur: formatTime24(dzuhurHour),
    ashar: formatTime24(asharHour),
    maghrib: formatTime24(maghribHour),
    isya: formatTime24(isyaHour),
    tanggal: tStr
  };
}

// Returns the name of the next prayer and the time left
export function getNextPrayerCountdown(times: PrayerTime, currentTime: Date): { name: string; countdown: string; progress: number } {
  const prayerNames = ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"] as const;
  const labelMap: Record<string, string> = {
    imsak: "Imsak",
    subuh: "Subuh",
    dzuhur: "Dzuhur",
    ashar: "Ashar",
    maghrib: "Maghrib",
    isya: "Isya"
  };

  const nowHour = currentTime.getHours();
  const nowMin = currentTime.getMinutes();
  const nowSec = currentTime.getSeconds();
  const nowTotalSec = nowHour * 3600 + nowMin * 60 + nowSec;

  const parseToSeconds = (timeStr: string): number => {
    if (timeStr === "--:--" || !timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 3600 + m * 60;
  };

  let nextName = "Subuh";
  let diffSec = 0;
  let prevSeconds = 0;
  let targetSeconds = 0;

  // Find next prayer today
  let found = false;
  for (let i = 0; i < prayerNames.length; i++) {
    const key = prayerNames[i];
    const pSec = parseToSeconds(times[key]);
    if (pSec > nowTotalSec) {
      nextName = labelMap[key];
      diffSec = pSec - nowTotalSec;
      
      prevSeconds = i === 0 ? parseToSeconds(times.isya) - 24 * 3600 : parseToSeconds(times[prayerNames[i - 1]]);
      targetSeconds = pSec;
      found = true;
      break;
    }
  }

  // If not found, it means it's after Isya, so next prayer is tomorrow's Imsak/Subuh
  if (!found) {
    nextName = "Imsak";
    const imsakSec = parseToSeconds(times.imsak);
    diffSec = (24 * 3600 - nowTotalSec) + imsakSec;
    prevSeconds = parseToSeconds(times.isya);
    targetSeconds = 24 * 3600 + imsakSec;
  }

  // Format countdown
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const hStr = hours > 0 ? `${hours}j ` : "";
  const mStr = `${minutes}m `;
  const sStr = `${seconds}d`;

  // Progress percentage
  let elapsed = nowTotalSec - prevSeconds;
  let totalSession = targetSeconds - prevSeconds;
  if (elapsed < 0) elapsed += 24 * 3600;
  if (totalSession < 0) totalSession += 24 * 3600;
  const progress = totalSession > 0 ? (elapsed / totalSession) * 100 : 0;

  return {
    name: nextName,
    countdown: `${hStr}${mStr}${sStr}`,
    progress: Math.min(100, Math.max(0, progress))
  };
}
