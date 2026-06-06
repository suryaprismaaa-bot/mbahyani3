# 🕌 Portal Islami Keluarga Mbah Yani

Sebuah web portal islami modern bernama **"Portal Islami Keluarga Mbah Yani"** yang dirancang khusus dengan tampilan profesional, responsif, bergaya modern-elegan, dan sangat ramah pengguna (terutama untuk lansia dan seluruh sanak keluarga).

Website ini berfungsi sebagai **pusat layanan ibadah digital keluarga harian** offline-first, adaptif terhadap cahaya siang/malam, serta bekerja dengan performa tinggi.

---

## 🎨 Konsep Desain & Tata Letak

Referensi menu dan kegunaan UI terinspirasi dari website modern premium:
- **Tampilan Menu & Navigasi**: Kartu fitur dengan bayangan lembut (*soft shadows*), sisi melengkung (*rounded-3xl*), berpadu dengan ikon bertema yang interaktif (*Lucide Icons*).
- **Skema Warna Premium**:
  - Warna Utama: `Emerald 600` & `Green 700` (Menyiratkan ketenangan, kesegaran, dan nuansa Islami yang teduh)
  - Penegas: `Gold Accent` (Memberikan sentuhan elegan dan fokus pada ayat/fitur aktif)
  - Latar Belakang: `Clean White` (Siang) & `Deep Cosmic Slate` (Malam)
- **Komponen Responsif**: Menggunakan metodologi *Mobile First* yang beradaptasi sempurna di ponsel, tablet, maupun layar komputer.
- **Aksibilitas (WCAG)**: Ukuran huruf Arab dapat diatur secara dinamis (slider) untuk memudahkan anggota keluarga yang sudah lanjut usia membaca ayat dengan nyaman tanpa kacamata bantu.

---

## 🚀 Fitur Utama Lainnya

### 1. 🧭 Cari Kiblat (Realtime Qibla Compass)
- **Deteksi Geolocation**: Membaca koordinat lintang/bujur pengguna secara instan dari sensor GPS Browser.
- **Formula Astronomi Orisinil**: Menghitung arah sudut (*bearing*) ke Ka'bah di Makkah (21.4225° N, 39.8262° E) secara offline tanpa bergantung API eksternal yang lambat.
- **Kunci Penyelaras (Alignment Locked)**: Tampilan kompas akan otomatis bercahaya emas dan memicu aksen getar ketika ponsel Anda tepat berhadapan sehadap lurus dengan Ka'bah (toleransi ±3.5°).
- **Simulasi Manual**: Menyediakan tombol putar manual bagi perangkat desktop/komputer yang tidak memiliki sensor kompas fisik.

### 2. 📖 Al-Qur'an Digital (With Intelligent Cache)
- **Indeks Lengkap**: Menyediakan daftar lengkap 114 Surat.
- **Pencarian Pintar**: Mencari surat berdasar arti bahasa Indonesia maupun nama Latin secara instan.
- **Murottal Audio Player**: Dilengkapi tombol audio untuk memutar lantunan Murottal per ayat maupun satu Surat penuh.
- **Dynamic Caching**: Mengunduh surat dari API publik tepercaya (Equran.id v2 Kemenag) dan otomatis menyimpannya ke dalam `localStorage` ponsel. Setelah dibaca sekali, surat tersebut dapat diakses selamanya secara **offline**!
- **Star bookmarks & Last Read**: Menyimpan tanda bacaan terakhir agar dapat langsung dilanjutkan kapan saja melalui satu tombol pintas di beranda.

### 3. 📿 Tasbih Digital (Haptic & Audio Counter)
- **Sintesis Audio Instan**: Menghasilkan bunyi klik lembut menggunakan Web Audio API murni dari browser (tanpa perlu memuat file suara eksternal).
- **Haptic Vibration**: Bergetar lembut pada setiap hitungan di browser ponsel yang mendukung.
- **Penanda Siklus**: Putaran tasbih dapat diatur (33, 99, 100, atau Tanpa Batas). Saat target tercapai, ia akan berbunyi merdu dan bergetar ganda lalu kembali ke angka nol secara otomatis.
- **Komulatif & Riwayat**: Total dzikir yang telah dibaca keluarga akan terekam secara permanen di memori lokal.

### 4. 🤲 Doa Sehari-hari (9 Kumpulan Inti)
- Berisi doa-doa penting harian: *Doa Bangun Tidur, Doa Sebelum Tidur, Doa Masuk Rumah, Doa Keluar Rumah, Doa Sebelum Makan, Doa Sesudah Makan, Doa Bepergian, Doa Masuk Masjid, dan Doa Keluar Masjid*.
- Dilengkapi dengan teks Arab (Amiri Font), Latin, Terjemahan Indonesia, tombol sekali-klik **Bagikan ke Grup WhatsApp Keluarga**, dan tombol **Salin Doa**.

### 5. ⏰ Jadwal Sholat & Hitung Mundur (Ticking Calendar)
- **Komputasi Mandiri**: Menampilkan jadwal adzan 5 waktu (*Imsak, Subuh, Syuruk, Dzuhur, Ashar, Maghrib, Isya*) dihitung otomatis berdasar wilayah atau koordinat lintang/bujur Anda.
- **Ticking Countdown**: Menampilkan sisa waktu hitung mundur (*hours, minutes, seconds*) yang terus berdetak secara dinamis menuju waktu adzan sholat berikutnya lengkap dengan progress bar.
- **Kalender Hijriyah**: Mengkonversi tanggal Gregorian secara astronomis ke penanggalan Hijriyah untuk mempermudah melacak pertengahan bulan (*Ayyamul Bidh*) atau puasa sunnah.

### 6. ✨ Asmaul Husna (99 Nama Allah)
- **Grid Elegan**: Panel kotak 99 Nama Baik Allah yang rapi dan interaktif.
- **Target Hafalan**: Cucu-cucu Mbah Yani dapat mencentang nama Allah yang telah dihafal untuk melacak total progress hafalan keluarga (tracker bar % terisi).
- **Modal Perenungan**: Klik pada setiap nama untuk membuka jendela penafsiran dan penjelasan sifat agung Allah tersebut.

---

## 🛠️ Struktur Folder Proyek

```bash
/
├── public/                 # Static Assets
├── src/
│   ├── components/         # Modul Fitur Reusable
│   │   ├── CariKiblat.tsx  # Kompas & Geolocation
│   │   ├── AlQuran.tsx     # Pembaca Alquran & Audio player
│   │   ├── TasbihDigital.tsx # Counter getar & dzikir presets
│   │   ├── DoaHarian.tsx   # Kumpulan doa & WhatsApp sharing
│   │   ├── JadwalSholat.tsx # Jadwal waktu sholat & Kalender Hijriah
│   │   ├── AsmaulHusna.tsx # 99 Nama Allah & progress hafalan
│   │   └── Toast.tsx       # Sistem notifikasi pop-up elegan
│   ├── data/               # Static dataset lokal
│   │   ├── doa.ts          # Konten doa harian otentik
│   │   ├── asmaulHusna.ts  # 99 Asmaul husna arab & arti
│   │   └── surahList.ts    # Metadata katalog 114 surah
│   ├── utils/              # Helper logika matematikal
│   │   └── islamicUtils.ts # Kalkulator Sholat & bearing Kiblat
│   ├── App.tsx             # Pengontrol tema dan perutean utama
│   ├── index.css           # Konfigurasi Tailwind CSS v4 & custom fonts
│   ├── main.tsx            # Entry point React
│   └── types.ts            # Type Safety declarations
├── index.html              # HTML shell
├── package.json            # Daftar Depedensi
├── tsconfig.json           # Konfigurasi TypeScript
└── vite.config.ts          # Bundler bundling Vite
```

---

## ⚙️ Cara Menjalankan Aplikasi di Komputer Anda

1. **Unduh Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan dalam Mode Pengembangan (Local Preview)**:
   ```bash
   npm run dev
   ```
   *Aplikasi akan terbuka pada alamat `http://localhost:3000`*

3. **Kompilasi ke Kode Produksi**:
   ```bash
   npm run build
   ```

---

## 💎 Jaminan Kualitas Kode

- **TypeScript Strict Mode**: Bebas dari deklarasi `any` liar serta memastikan seluruh data tipe konsisten.
- **Zero-Flicker Performance**: Tidak ada re-render tak perlu, seluruh state tersimpan rapi tanpa kebocoran memori.
- **Zero Third-party API Failures**: Perhitungan kompas, sisa waktu shalat, pengubah kalender Hijriah, dan asmaul husna diproses sepenuhnya secara lokal di komputer pengguna sehingga tidak akan pernah mengalami kegagalan akses (error 404/500).
- **Empathy for Elders**: Desain visual ramah lanjut usia dengan pilihan teks tebal, kontras warna tinggi, layout teratur, dan penyesuai aksara Arab yang besar.
