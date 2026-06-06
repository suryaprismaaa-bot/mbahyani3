export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
}

export interface Verse {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SurahDetail extends Surah {
  ayat: Verse[];
}

export interface Doa {
  id: string;
  judul: string;
  arab: string;
  latin: string;
  terjemahan: string;
  kategori: string;
}

export interface AsmaulHusnaItem {
  urutan: number;
  arab: string;
  latin: string;
  arti: string;
}

export interface PrayerTime {
  imsak: string;
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  tanggal: string;
}
