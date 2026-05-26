# CLAUDE.md
### Product Requirements Document · v1.0

> **Status:** Draft  
> **Author:** Solo Developer  
> **Stack:** Next.js · Supabase · Google Gemini · MediaPipe  
> **Target Release:** Full Feature · Single Deployment

---

## 1. Executive Summary

**Problem:** Gaya hidup sedenter (kurang gerak) menjadi masalah kesehatan yang meluas. Mayoritas orang memiliki niat untuk bergerak tetapi tidak memiliki motivasi yang cukup — olahraga terasa membosankan, monoton, dan tidak ada reward instan.

**Solution:** MotionQuest adalah web game target-hitting berbasis gerakan tubuh real-time. Pengguna memukul target yang muncul di layar menggunakan anggota tubuh mereka, dipandu oleh narasi cerita yang di-generate AI setiap sesi. Game ini menggabungkan motivasi ekstrinsik (skor, rank, leaderboard) dengan motivasi intrinsik (cerita yang berubah tiap main).

**Core Differentiator:** Bukan rhythm game — melainkan "Whack-a-Mole dengan tubuh sendiri" + narasi AI yang membuat setiap sesi terasa unik.

**Target User:**
- Usia 16–35 tahun
- Familiar dengan mobile/casual gaming
- Memiliki akses ke komputer dengan kamera
- Menginginkan aktivitas fisik ringan–sedang tanpa harus pergi ke gym

---

## 2. Tujuan Produk & KPI

### 2.1 Tujuan Bisnis
1. Membuktikan bahwa gamifikasi gerakan tubuh efektif meningkatkan durasi aktivitas fisik harian
2. Membangun basis pengguna aktif yang dapat dimonetisasi (premium mode, custom story themes) di masa depan
3. Menjadi referensi teknis untuk web-based motion game dengan performa tinggi

### 2.2 KPI Utama

| KPI | Target v1.0 | Periode Ukur |
|---|---|---|
| Sesi > 5 menit di first play | ≥ 40% pengguna baru | Rolling 30 hari |
| Day-1 Retention | ≥ 30% | Per cohort mingguan |
| Day-3 Retention | ≥ 20% | Per cohort mingguan |
| Session/User (minggu pertama) | 3–4 sesi | Per user |
| Drop rate karena tracking error | < 15% | Per minggu |
| Leaderboard participation | ≥ 60% registered users | Rolling 30 hari |

---

## 3. User Personas

### Persona A — "The Reluctant Mover"
**Nama:** Dinda, 24 tahun, remote worker  
**Konteks:** Duduk 8+ jam sehari, tahu harus olahraga tapi selalu menunda. Suka game casual di sela kerja.  
**Pain Point:** Olahraga terasa seperti kewajiban, bukan hiburan.  
**Goal:** Ingin bergerak tanpa sadar sedang "olahraga".  
**Mode yang dipilih:** Half Body (bisa dimainkan sambil duduk di kursi kerja)

### Persona B — "The Casual Competitor"
**Nama:** Bima, 19 tahun, mahasiswa  
**Konteks:** Suka gaming, punya ruang bermain terbatas, bosan dengan game duduk.  
**Pain Point:** Ingin pengalaman game yang lebih fisik tanpa perangkat mahal.  
**Goal:** Beat high score teman, naik rank.  
**Mode yang dipilih:** Full Body

---

## 4. User Journey

```
[Landing Page]
      │
      ▼
[Auth Screen]
  ├── Login (email / OAuth Google)
  ├── Register
  └── Lanjut sebagai Guest
      │
      ▼
[MAIN MENU]
  ├── Tombol: Start Game  ──────────────────────────────────┐
  ├── Tombol: Leaderboard                                   │
  ├── Tombol: Profile / Riwayat Sesi                        │
  └── Tombol: Settings                                      │
                                                            ▼
                                               [Pilih Game Mode]
                                         ┌─────────┬─────────────┬──────────┐
                                         │  STORY  │ TIME TARGET │ PRACTICE │
                                         └────┬────┴──────┬──────┴────┬─────┘
                                              │           │           │
                                    Narasi AI │  Target   │  Bebas,   │
                                    + target  │  selesai  │  tanpa    │
                                    sequence  │  dalam    │  batas    │
                                    dari AI   │  X menit  │  waktu    │
                                              │           │           │
                                              └─────┬─────┘           │
                                                    │                 │
                                                    ▼                 ▼
                                         [Pilih Body Mode]
                                         ┌─────────────────────────────┐
                                         │  FULL BODY  │  HALF BODY   │
                                         │ (berdiri)   │  (duduk)     │
                                         └──────┬──────┴──────┬───────┘
                                                │             │
                            ┌───────────────────┘             └────────────────────┐
                            │                                                       │
                            ▼                                                       ▼
              [AI Pre-fetch dimulai di background]                  [AI Pre-fetch dimulai di background]
                ├── GameplayData JSON (prioritas ①)                  (khusus upper body joints)
                └── Story text & theme (prioritas ②)
                            │
                            ▼
                  [Wizard Kalibrasi: 3 Langkah]
                  Langkah 1: Izin kamera + device check
                  Langkah 2: Cek pencahayaan (auto-feedback)
                  Langkah 3: Posisi tubuh (siluet overlay,
                             konfirmasi joint terdeteksi)
                            │
                            ▼
                  [Loading Screen — Story Introduction]
                  (hanya untuk mode Story)
                  Tampilkan narasi + tunggu GameplayData siap
                            │
                            ▼
                  [GAMEPLAY LOOP]
                  Target spawn → User hit → Score/Combo update
                            │
                            ├── [Tracking hilang]
                            │       └── Soft Pause → Hard Pause → Resume
                            │
                            ├── [Mode TIME TARGET: waktu habis] ──┐
                            ├── [Mode STORY: semua target selesai]──┤
                            └── [Mode PRACTICE: user tekan Stop] ──┘
                                                                   │
                                                                   ▼
                                                         [Results Screen]
                                                   Skor, kombo, durasi,
                                                   perbandingan sesi lalu
                                                                   │
                                                                   ▼
                                                   [Update Leaderboard + Rank]
                                                   (hanya Story & Time Target)
                                                                   │
                                                                   ▼
                                                   [CTA: Main Lagi / Ganti Mode
                                                         / Kembali ke Main Menu]
```

### Perbedaan Perilaku per Game Mode

| Aspek | Story | Time Target | Practice |
|---|---|---|---|
| Konten | Narasi AI + target sequence dari AI | Target acak, durasi dipilih user (1/3/5 menit) | Target acak, tidak ada batas waktu |
| AI Pre-fetch | ✅ Wajib (GameplayData + story) | ❌ Tidak perlu (logika generatif lokal) | ❌ Tidak perlu |
| Skor ke Leaderboard | ✅ Ya | ✅ Ya | ❌ Tidak |
| Combo & Multiplier | ✅ Ya | ✅ Ya | ✅ Ya (tapi tidak disimpan) |
| Kondisi Selesai | Semua target dari sequence habis | Timer mencapai 0 | User menekan tombol Stop |
| Instruksi Posisi | Sesuai mode (Full/Half) | Sesuai mode (Full/Half) | Sesuai mode (Full/Half) |

---

## 5. Fitur Detail

### 5.1 Landing Page & Auth

**Deskripsi:** Halaman pertama yang dilihat pengguna. Harus convey value proposition dalam < 5 detik.

**Acceptance Criteria:**
- [ ] Terdapat demo GIF/video singkat yang menunjukkan gameplay
- [ ] CTA utama: "Mulai Main" (mengarah ke halaman auth)
- [ ] CTA sekunder: "Coba sebagai Guest" (skip auth, langsung ke main menu)
- [ ] Halaman auth: form login + register dalam satu halaman (tab toggle)
- [ ] OAuth Google tersedia sebagai opsi login cepat
- [ ] Redirect post-login/register → `/menu` (Main Menu) selalu, tanpa exception

---

### 5.2 Main Menu

**Deskripsi:** Hub utama setelah login. Titik navigasi ke semua fitur game.

**Acceptance Criteria:**
- [ ] Menampilkan nama user + rank badge saat ini (guest: tampilkan "Guest")
- [ ] Tombol **Start Game** → navigasi ke halaman Pilih Game Mode
- [ ] Tombol **Leaderboard** → navigasi ke `/leaderboard`
- [ ] Tombol **Profile** → navigasi ke `/profile` (riwayat sesi, statistik)
- [ ] Tombol **Settings** → modal settings (bahasa, kamera preference)
- [ ] Best score user ditampilkan di main menu (untuk registered user)
- [ ] Guest: tampilkan banner CTA untuk register agar skor tersimpan

---

### 5.3 Pilih Game Mode & Body Mode

**Deskripsi:** Dua langkah pemilihan setelah user menekan Start Game.

#### Langkah 1 — Pilih Game Mode

| Mode | Deskripsi | Durasi |
|---|---|---|
| **Story** | Narasi AI unik + target sequence dari AI | Sampai semua target selesai |
| **Time Target** | Target acak, user pilih durasi | 1 / 3 / 5 menit |
| **Practice** | Target acak, tanpa batas, tanpa skor tersimpan | User stop sendiri |

**Acceptance Criteria:**
- [ ] Setiap mode ditampilkan sebagai card dengan ilustrasi + deskripsi singkat
- [ ] Mode Time Target: setelah dipilih, muncul sub-opsi durasi (1 / 3 / 5 menit)
- [ ] Mode yang dipilih disimpan di session state (digunakan hingga results screen)

#### Langkah 2 — Pilih Body Mode

**Acceptance Criteria:**
- [ ] Ditampilkan setelah game mode dipilih (halaman terpisah atau step berikutnya)
- [ ] Dua pilihan: **Full Body** (berdiri) dan **Half Body** (duduk)
- [ ] Dilengkapi ilustrasi posisi tubuh yang benar untuk masing-masing
- [ ] Setelah body mode dipilih → AI Pre-fetch dimulai di background (khusus mode Story)
- [ ] Langsung lanjut ke Wizard Kalibrasi

---

### 5.4 Onboarding & Kalibrasi

**Deskripsi:** Wizard 3-langkah yang memastikan kondisi optimal sebelum bermain.

**Langkah 1 — Izin & Device Check**
- [ ] Request kamera permission dengan penjelasan mengapa diperlukan
- [ ] Deteksi apakah kamera tersedia; tampilkan error friendly jika tidak ada
- [ ] Tampilkan konfirmasi body mode yang sudah dipilih (dengan opsi "Ganti")

**Langkah 2 — Cek Pencahayaan**
- [ ] Analisis brightness rata-rata frame secara real-time
- [ ] Tampilkan indikator: "Terlalu gelap / Sudah pas / Terlalu terang"
- [ ] Berikan saran spesifik: "Nyalakan lampu di depan kamu" / "Hindari cahaya dari belakang"
- [ ] Threshold pencahayaan: brightness < 80 = terlalu gelap, > 220 = terlalu terang (skala 0–255)

**Langkah 3 — Posisi Tubuh**
- [ ] Tampilkan siluet tubuh sesuai body mode (Full: seluruh tubuh; Half: tubuh atas)
- [ ] Overlay skeleton real-time dari MediaPipe di atas video feed
- [ ] Tampilkan checklist joint yang sudah terdeteksi
- [ ] Konfirmasi otomatis setelah semua required joints stabil 3 detik
- [ ] Required joints Full Body: shoulders, elbows, wrists, hips, knees, ankles (12 joints)
- [ ] Required joints Half Body: shoulders, elbows, wrists (6 joints)

---

### 5.5 AI Story Generation (Pre-fetch)

**Deskripsi:** AI bertindak sebagai "Sutradara" yang menghasilkan konteks cerita unik dan data spawning target. Hanya aktif saat game mode **Story** dipilih.

**Trigger:** Dimulai paralel segera setelah user memilih body mode (Full/Half), sebelum kalibrasi dimulai — sehingga saat kalibrasi selesai, data sudah (hampir) siap.

**Input ke Gemini:**
```
System Prompt: Kamu adalah game director untuk fitness game. Generate sebuah level game beserta sequence target yang ergonomis dan aman untuk dimainkan.

User Prompt: 
- Mode: [full_body / half_body]
- Difficulty: [easy / medium / hard] (berdasarkan riwayat user atau default medium)
- Theme: [random dari: "petualangan hutan", "pertarungan luar angkasa", "ninja dojo", "balapan futuristik"]

Output HANYA dalam JSON sesuai schema yang diberikan. Jangan tambahkan teks di luar JSON.
```

**Acceptance Criteria:**
- [ ] Gemini dipanggil dengan parameter `response_mime_type: "application/json"` dan `response_schema` sesuai JSON Schema di requirements.md
- [ ] Timeout AI call: 10 detik. Jika timeout, gunakan fallback preset
- [ ] Fallback preset tersedia untuk setiap kombinasi mode + difficulty (min. 3 preset per kombinasi = 18 total preset)
- [ ] Sanitasi dilakukan setelah response diterima sebelum data digunakan
- [ ] Progress loading AI ditampilkan di loading screen (bukan spinner buta)

**Alur Loading (Progressive Enhancement):**
```
T+0s:  Kalibrasi selesai → AI call dimulai + Loading screen tampil
T+1s:  Story text selesai → Tampilkan narasi cerita ke pengguna
T+3s:  GameplayData JSON selesai → Tombol "Mulai Game" aktif
T+5s:  (opsional) Illustration prompt selesai → Update background visual
T+10s: Timeout → Gunakan fallback, tombol "Mulai Game" aktif
```

---

### 5.6 Gameplay Engine

**Deskripsi:** Inti dari pengalaman game. Harus berjalan mulus di 60fps.

#### 5.6.1 Arsitektur Threading

```
Main Thread
├── React UI: score overlay, pause screen, notifications
└── Menerima pose data dari Worker via postMessage

pose-worker.ts (Web Worker)
├── MediaPipe PoseLandmarker (WASM/WebGL)
├── Capture frame dari OffscreenCanvas
├── Proses pose tiap frame
└── Transfer ArrayBuffer ke Main Thread
```

**Acceptance Criteria Threading:**
- [ ] MediaPipe berjalan eksklusif di Web Worker, tidak di Main Thread
- [ ] Pose data dikirim sebagai `Float32Array` menggunakan Transferable Objects
- [ ] Jika `SharedArrayBuffer` tersedia (COOP/COEP aktif): gunakan SharedArrayBuffer
- [ ] Jika tidak tersedia: fallback ke `postMessage` dengan Transferable ArrayBuffer
- [ ] Frame rate target: 60fps pada hardware mid-range (laptop Intel i5 gen 10+)

#### 5.6.2 Target System

**Acceptance Criteria:**
- [ ] Target dirender sebagai lingkaran dengan warna sesuai tema cerita
- [ ] Target memiliki progress ring yang menyusut seiring countdown
- [ ] Ukuran target bervariasi berdasarkan `radius_percent` dari GameplayData
- [ ] Posisi target dalam koordinat persentase viewport (responsif)
- [ ] Maksimal 2 target aktif di layar bersamaan (mencegah kebingungan)
- [ ] Hit detection: Euclidean distance antara joint position dan target center < target radius
- [ ] Hit sound effect diputar saat berhasil memukul

#### 5.6.3 Skor & Combo

| Kondisi | Efek |
|---|---|
| Hit normal | +100 poin |
| Hit cepat (< 30% durasi target tersisa) | +150 poin (1.5x) |
| Combo 3x | Multiplier 2x |
| Combo 5x | Multiplier 3x |
| Combo 10x | Multiplier 4x (max) |
| Miss (timeout) | Combo reset ke 0, skor tidak berkurang |

#### 5.6.4 Occlusion Handling

**State Machine:**

```
TRACKING_OK
    │ (tidak ada pose > 1 detik)
    ▼
SOFT_PAUSE
  ├── Game speed: 50%
  ├── Screen: meredup (opacity 60%)
  └── (pose kembali terdeteksi) → kembali ke TRACKING_OK
    │ (masih tidak ada pose > 3 detik total)
    ▼
HARD_PAUSE
  ├── Game berhenti penuh
  ├── Tampilkan instruksi posisi (sesuai mode)
  └── (pose kembali stabil 1 detik) → kembali ke TRACKING_OK
```

**Acceptance Criteria:**
- [ ] Transisi Soft Pause menggunakan CSS transition (tidak tiba-tiba)
- [ ] Instruksi Hard Pause berbeda untuk Full Body vs Half Body
- [ ] Timer Soft/Hard Pause tidak mengurangi waktu sesi
- [ ] Jumlah Hard Pause dicatat di `game_sessions` untuk analisis drop-off

---

### 5.7 Results Screen

**Acceptance Criteria:**
- [ ] Tampilkan: skor final, max combo, jumlah hit/miss, durasi sesi
- [ ] Perbandingan dengan sesi sebelumnya (jika ada): "▲ +320 dari sesi terakhir"
- [ ] Animasi skor counter (angka naik dari 0)
- [ ] Tampilkan rank saat ini dan progress ke rank berikutnya
- [ ] Tombol: "Main Lagi" (mode sama) / "Ganti Mode" / "Lihat Leaderboard"
- [ ] Skor otomatis disimpan ke Supabase setelah layar ini ditampilkan

---

### 5.8 Leaderboard & Rank

**Acceptance Criteria:**
- [ ] Leaderboard global menampilkan top 100 per mode
- [ ] Posisi user saat ini selalu terlihat (sticky row jika tidak di top 100)
- [ ] Update leaderboard: real-time menggunakan Supabase Realtime subscription
- [ ] Sistem rank berdasarkan best score kumulatif:

| Rank | Threshold Skor |
|---|---|
| Bronze | 0 – 4,999 |
| Silver | 5,000 – 14,999 |
| Gold | 15,000 – 34,999 |
| Diamond | 35,000 – 74,999 |
| Master | 75,000+ |

- [ ] Badge rank ditampilkan di profil dan di samping nama di leaderboard

---

## 6. Spesifikasi Teknis per Role

### 6.1 Frontend Developer

**Halaman yang perlu dibuat (Next.js App Router):**

```
app/
├── page.tsx                         ← Landing page
├── auth/
│   └── page.tsx                     ← Login + Register (tab toggle)
├── menu/
│   └── page.tsx                     ← Main Menu
├── play/
│   ├── mode/page.tsx                ← Pilih Game Mode (Story/Time Target/Practice)
│   ├── body/page.tsx                ← Pilih Body Mode (Full/Half) + AI pre-fetch trigger
│   ├── calibrate/page.tsx           ← Wizard Kalibrasi 3 langkah (Client Component)
│   ├── loading/page.tsx             ← Story loading screen (mode Story saja)
│   ├── game/page.tsx                ← Game container + canvas (Client Component)
│   └── results/page.tsx             ← Results screen
├── leaderboard/
│   └── page.tsx
└── profile/
    └── page.tsx
```

**Komponen kritis:**
- `<CameraFeed />` — video element + canvas overlay untuk siluet
- `<PoseOverlay />` — render skeleton dots dari pose data
- `<GameCanvas />` — OffscreenCanvas wrapper, forward ke Web Worker
- `<TargetRenderer />` — render target circles (boleh di canvas atau SVG overlay)
- `<HitEffect />` — particle animation saat hit

**State management (Zustand store):**
```typescript
interface GameStore {
  // Pilihan user sebelum game
  gameMode: 'story' | 'time_target' | 'practice' | null;
  bodyMode: 'full_body' | 'half_body' | null;
  timeDuration: 60 | 180 | 300 | null;   // detik, untuk mode Time Target

  // State gameplay
  score: number;
  combo: number;
  multiplier: number;
  trackingStatus: 'ok' | 'soft_pause' | 'hard_pause';
  activeTargets: Target[];
  sessionDuration: number;
  gamePhase: 'idle' | 'mode_select' | 'calibrating' | 'loading' | 'playing' | 'paused' | 'finished';

  // Actions
  setGameMode: (mode: GameStore['gameMode']) => void;
  setBodyMode: (mode: GameStore['bodyMode']) => void;
  resetSession: () => void;
}
```

---

### 6.2 Game Developer / Motion Logic

**pose-worker.ts — tanggung jawab:**
1. Inisialisasi MediaPipe `PoseLandmarker` dengan model `pose_landmarker_lite.task`
2. Loop: capture frame → run detection → encode Float32Array → transfer ke Main Thread
3. Handle pesan dari Main Thread: `{ type: 'start' | 'stop' | 'pause' }`

**Hit detection algorithm:**
```typescript
function checkHit(jointPos: {x: number, y: number}, target: Target): boolean {
  const dx = jointPos.x - target.centerX;
  const dy = jointPos.y - target.centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < target.radius;
}
```

**Koordinat normalisasi:** MediaPipe mengembalikan koordinat [0,1] normalized. Kalikan dengan viewport width/height untuk mendapatkan pixel coordinates.

---

### 6.3 AI Engineer / Backend

**Gemini integration (`/api/generate-level`):**

```typescript
// app/api/generate-level/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { mode, difficulty, theme } = await req.json();
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: GAMEPLAY_DATA_SCHEMA, // JSON Schema dari requirements.md
    },
  });

  const result = await model.generateContent(buildPrompt(mode, difficulty, theme));
  const raw = JSON.parse(result.response.text());
  const sanitized = sanitizeGameplayData(raw, mode); // Wajib sanitasi sebelum return
  
  return Response.json(sanitized);
}
```

**Sanitasi wajib (`sanitizeGameplayData`):**
```typescript
function sanitizeGameplayData(data: any, mode: string): GameplayData {
  return {
    ...data,
    target_sequence: data.target_sequence.map((t: any) => ({
      ...t,
      x_percent: clamp(t.x_percent, 5, 95),
      y_percent: clamp(t.y_percent, 5, 95),
      radius_percent: clamp(t.radius_percent, 3, 15),
      duration_ms: clamp(t.duration_ms, 500, 5000),
      delay_ms: clamp(t.delay_ms, 200, 3000),
      valid_joints: mode === 'half_body' 
        ? t.valid_joints.filter(j => !LOWER_BODY_JOINTS.includes(j))
        : t.valid_joints,
    }))
  };
}
```

---

## 7. Edge Cases & Penanganan Error

| Skenario | Penanganan |
|---|---|
| Kamera tidak tersedia | Tampilkan error page dengan instruksi aktifkan kamera |
| Gemini API down / timeout | Gunakan fallback preset hardcoded; notifikasi UI "Mode offline aktif" |
| Pose tidak terdeteksi sejak awal kalibrasi | Tampilkan tips: cahaya, jarak, latar belakang |
| Browser tidak support Web Worker | Fallback: jalankan MediaPipe di Main Thread (performa turun, tampilkan warning) |
| COOP/COEP tidak aktif (SharedArrayBuffer tidak tersedia) | Fallback ke postMessage + Transferable ArrayBuffer |
| Skor gagal tersimpan ke Supabase | Simpan di localStorage, retry saat koneksi kembali |
| Tab/window kehilangan fokus saat game | Trigger Hard Pause otomatis |
| User menutup halaman saat game berlangsung | Simpan partial session dengan `drop_reason: 'user_quit'` via `beforeunload` event |

---

## 8. Roadmap & Prioritas

> Karena ini full feature release oleh solo developer, urutan pengerjaan direkomendasikan sebagai berikut:

### Sprint 1 — Foundation (Minggu 1–2)
- [ ] Setup Next.js project + Supabase + COOP/COEP headers di `next.config.js`
- [ ] Halaman auth (`/auth`) — login, register, guest mode
- [ ] Halaman Main Menu (`/menu`) — navigasi dasar, tampil username + rank placeholder
- [ ] Halaman Pilih Game Mode (`/play/mode`) — 3 card: Story, Time Target, Practice
- [ ] Halaman Pilih Body Mode (`/play/body`) — Full vs Half dengan ilustrasi
- [ ] Basic camera feed + MediaPipe integration di Main Thread (belum Worker)
- [ ] Pose overlay (skeleton visualization)

### Sprint 2 — Core Gameplay (Minggu 3–4)
- [ ] Migrasi MediaPipe ke Web Worker
- [ ] Transferable ArrayBuffer pose data
- [ ] Target spawning system (pakai preset data dulu, belum AI)
- [ ] Hit detection
- [ ] Skor & combo system

### Sprint 3 — Onboarding & Polish (Minggu 5)
- [ ] Wizard kalibrasi lengkap (brightness check, joint detection)
- [ ] Occlusion handling (Soft Pause + Hard Pause)
- [ ] Results screen

### Sprint 4 — AI & Leaderboard (Minggu 6)
- [ ] Gemini API integration + JSON Schema
- [ ] Sanitasi + fallback preset
- [ ] Loading screen dengan story text
- [ ] Leaderboard + Rank system (Supabase)

### Sprint 5 — QA & Launch Prep (Minggu 7)
- [ ] Cross-browser testing (Chrome, Edge, Firefox, Safari)
- [ ] Performance profiling (target 60fps)
- [ ] Drop-off tracking implementation
- [ ] Final bug fixes + deployment

---

## 9. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|
| MediaPipe tidak mencapai 60fps di hardware rendah | Tinggi | Tinggi | Gunakan model `lite`, adaptive quality (turunkan resolusi input jika fps < 30) |
| SharedArrayBuffer diblokir oleh browser/CDN | Sedang | Sedang | Implementasi fallback Transferable ArrayBuffer sejak awal |
| Gemini output tidak sesuai schema | Sedang | Tinggi | Structured Output + sanitasi + fallback preset |
| User berhenti karena kalibrasi terlalu sulit | Tinggi | Tinggi | Tambahkan "Skip kalibrasi" dengan warning, tidak wajib perfect calibration |
| COOP header memblokir embed/iframe pihak ketiga | Rendah | Sedang | Terapkan header hanya di route `/game/*` jika diperlukan |

---

## 10. Definisi Done (Definition of Done)

Sebuah fitur dianggap selesai apabila:
1. ✅ Acceptance criteria semua terpenuhi
2. ✅ Tidak ada error di browser console saat normal usage
3. ✅ Berfungsi di Chrome terbaru (primary) dan Edge terbaru
4. ✅ Responsive di viewport 1280px dan 1920px
5. ✅ Data yang relevan tersimpan di Supabase dengan benar
6. ✅ Edge case utama (lihat Seksi 7) sudah ditangani

---

*Dokumen ini adalah living document. Update setiap ada perubahan scope atau keputusan teknis baru.*