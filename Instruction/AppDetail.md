# AppDetail.md — Zenith: The Vision Master

## Deskripsi Aplikasi

**Zenith: The Vision Master** adalah game fitness berbasis computer vision yang menggunakan gerakan tubuh sebagai controller. Aplikasi ini dikembangkan untuk submission hackathon #JuaraVibeCoding by Google, menggunakan ekosistem AI/ML Google (Gemini, MediaPipe, Firebase).

### Konsep Utama

Aplikasi ini menggabungkan dua teknologi utama:
1. **Computer Vision Controller** - Deteksi pose tubuh real-time menggunakan MediaPipe Pose untuk mengontrol aksi dalam game
2. **Agentic AI Sensei** - Instruktur adaptif berbasis Gemini 3.0 Flash yang menganalisis kualitas gerakan dan memberikan feedback narasi dinamis

---

## Target Pengguna

### Pengguna Utama
- **Developer dan mahasiswa yang sedentary** (kurang gerak) yang ingin berolahraga sambil bermain game
- **Pengguna yang ingin meningkatkan postur** melalui latihan gerakan martial arts
- **Pengguna yang mencari pengalaman gaming yang interaktif dan berbasis gerakan fisik**

### Pengguna Tambahan
- **Pengguna dengan mobilitas terbatas** (dengan fitur fallback voice command)
- **Pemula dalam fitness** yang ingin latihan yang menyenangkan dan gamified

---

## Fitur Utama Aplikasi

### 1. Computer Vision Controller
- **Deteksi 33 landmark tubuh** menggunakan MediaPipe Pose dengan latensi < 100ms
- **3 gesture utama** yang dikenali:
  - **Punch** - Serangan untuk menghancurkan target
  - **Squat** - Dodge untuk menghindari serangan musuh
  - **Horse Stance** - Power charge untuk meningkatkan damage
- **Overlay skeleton real-time** selama kalibrasi
- **Validasi pencahayaan** (Lux check ≥ 50) sebelum sesi dimulai
- **Performa ≥ 30 FPS** pada device mid-range

### 2. Agentic AI Sensei (Gemini 3.0 Flash)
- **Feedback narasi dinamis** berdasarkan akurasi pose (Good/Fair/Poor)
- **Gemini Function Calling** untuk memicu aksi in-game:
  - `triggerCombo` - Mengaktifkan animasi combo khusus
  - `adjustDifficulty` - Menyesuaikan kesulitan secara dinamis
- **Streaming response** untuk pengalaman yang responsif
- **Fallback feedback** saat koneksi lambat atau error

### 3. Firebase Integration
- **Firebase Authentication** (Google Sign-In) untuk identifikasi pemain
- **Firestore** untuk menyimpan:
  - Skor sesi
  - Statistik (combo tertinggi, akurasi rata-rata)
  - Leaderboard top 10
- **Offline mode** - Skor tersimpan lokal dan di-sync saat online

### 4. Gameplay System
- **Session timer** dengan durasi yang dapat dikonfigurasi (default 60 detik)
- **Target spawning** dengan kesulitan yang dapat disesuaikan
- **Hit detection** berbasis overlap antara joint dan target
- **Combo system** untuk menghitung streak hits
- **Score tracking** dengan bonus untuk horse stance charge

---

## Halaman (Pages) dan Fitur

### 🏠 Halaman Home (`/`)

**File:** `src/app/page.tsx`

**Deskripsi:**
Halaman landing yang menyambut pengguna dan memberikan navigasi ke fitur utama aplikasi.

**Fitur:**
- **Welcome card** dengan deskripsi aplikasi
- **Navigasi utama** ke:
  - Start Session → `/calibration`
  - Open Combat HUD → `/game`
- **AI Insights panel** (placeholder untuk Sensei feedback)
- **Three-column layout** dengan Navigation di kiri, konten di tengah, insights di kanan

**Komponen:**
- `AppShell` - Layout container
- `Navigation` - Menu navigasi
- `Card` - Container untuk konten
- `Button` - Tombol navigasi
- `ActionRow` - Container untuk tombol

---

### 🎯 Halaman Kalibrasi (`/calibration`)

**File:** `src/app/calibration/page.tsx`

**Deskripsi:**
Halaman kalibrasi kamera dan pengecekan kondisi lingkungan sebelum memulai sesi game.

**Fitur:**
- **Vision Feed Panel** - Menampilkan feed kamera real-time
- **Pose overlay** - Menampilkan skeleton tubuh saat deteksi aktif
- **Lux check** - Validasi pencahayaan (minimum 50 lux)
- **FPS counter** - Monitoring performa deteksi pose
- **Landmark visibility check** - Validasi minimal 20 dari 33 landmark terdeteksi
- **Empty state** - Pesan saat belum ada pose terdeteksi
- **Error handling** - Tampilan error saat kamera gagal

**Komponen:**
- `VisionFeedPanel` - Panel feed kamera + overlay pose
- `CalibrationOverlay` - UI untuk lux check dan statistik deteksi
- `ErrorState` - Tampilan error
- `EmptyState` - Tampilan kosong

**Validasi:**
- Pencahayaan ≥ 50 lux
- Minimal 20 landmark dengan visibility > 0.6
- Kamera aktif dan izin diberikan

---

### ⚔️ Halaman Combat Game (`/game`)

**File:** `src/app/game/page.tsx`

**Deskripsi:**
Halaman utama gameplay di mana pengguna bermain game menggunakan gerakan tubuh sebagai controller.

**Fitur:**
- **Combat HUD** - Tampilan antarmuka permainan:
  - Timer sesi (countdown)
  - Progress bar sesi
  - Score saat ini
  - Counter hits dan misses
  - Best streak counter
- **Camera Target Overlay** - Feed kamera dengan target AR:
  - Target spawning di posisi acak
  - Overlay skeleton pose
  - Indikator target aktif
- **Gesture Detection** - Deteksi real-time:
  - Punch - untuk menghancurkan target
  - Squat - untuk dodge (placeholder)
  - Horse Stance - untuk power charge
- **Combo System** - Tracking streak hits
- **Debug Info** - FPS, lighting, pose validity, last gesture
- **Sensei HUD** - Panel feedback AI (placeholder)
- **End Session** - Tombol untuk mengakhiri sesi

**Komponen:**
- `CombatHud` - HUD permainan
- `CameraTargetOverlay` - Overlay kamera + target
- `SenseiHud` - Panel AI Sensei
- `ErrorState` - Tampilan error
- `EmptyState` - Tampilan saat belum ada pose

**Hooks:**
- `useVisionSession` - Manajemen sesi MediaPipe
- `useMovementLogic` - Klasifikasi gesture
- `useCombatSession` - Timer sesi
- `useTargetSpawner` - Spawning target
- `useTargetHitDetection` - Deteksi hit target
- `useGameplayStore` - State management (Zustand)

**Mekanik:**
- Sesi durasi 60 detik (dapat diubah)
- Target spawn dengan interval yang dapat disesuaikan
- Hit detection berbasis overlap joint-target
- Bonus score saat horse stance aktif (20 vs 10 poin)
- Cooldown 300ms antar gesture untuk mencegah false positive

---

### 📊 Halaman Session Summary (`/session`)

**File:** `src/app/session/page.tsx`

**Deskripsi:**
Halaman ringkasan sesi yang menampilkan statistik permainan dan leaderboard.

**Fitur:**
- **Session Stats** - Statistik sesi:
  - Score akhir
  - Total hits
  - Total misses
  - Hit rate (persentase)
  - Best streak
- **Empty State** - Pesan saat belum ada sesi yang dimainkan
- **Leaderboard** - Top 10 skor (placeholder/mock)
- **Start Again** - Tombol untuk memulai sesi baru
- **Return Home** - Tombol untuk kembali ke halaman utama

**Komponen:**
- `LeaderboardPlaceholder` - Tampilan leaderboard (mock)
- `EmptyState` - Tampilan kosong

**Flow:**
- Otomatis redirect dari `/game` saat sesi berakhir
- Reset state saat klik "Start Again"
- Navigasi ke home saat klik "Return Home"

---

## Komponen Fitur Lainnya

### 🎥 Vision Components
- **PoseCanvas** - Render canvas untuk MediaPipe pose visualization
- **VisionFeedPanel** - Panel feed kamera dengan loading state
- **CalibrationOverlay** - UI untuk kalibrasi dan validasi lingkungan

### ⚡ Gameplay Components
- **CombatArena** - Arena permainan (placeholder)
- **CombatHud** - HUD permainan dengan timer, score, stats
- **CameraTargetOverlay** - Overlay kamera dengan target AR

### 🤖 Sensei Components
- **SenseiHud** - Panel feedback AI Sensei (placeholder untuk Gemini integration)

### 🏆 Leaderboard Components
- **LeaderboardPlaceholder** - Tampilan leaderboard (mock, akan diintegrasikan dengan Firestore)

---

## Teknologi yang Digunakan

### Frontend
- **React 18** - UI framework
- **Next.js 14** (App Router) - Meta-framework + API Routes
- **TypeScript 5** - Type safety
- **Framer Motion** - Animasi

### Google AI/ML Stack
- **Gemini 3.0 Flash** - AI Sensei untuk feedback dan function calling
- **MediaPipe Pose** - Deteksi pose tubuh real-time (WASM, client-side)

### Backend & Data
- **Firebase Authentication** - Google Sign-In
- **Firebase Firestore** - Database untuk leaderboard dan session stats
- **Next.js Route Handlers** - API endpoints untuk Gemini (aman, API key di server)

### State Management
- **TanStack Query 5** - Server state (Gemini feedback, Firestore queries)
- **Zustand 4** - Global client state (score, health, combo, difficulty)

### Styling
- **CSS Modules** - Scoped styling
- **Google Fonts** - Orbitron (headings) + Inter (body)
- **Lucide React** - Icons

---

## Flow Pengguna

```
1. User membuka aplikasi → Halaman Home
2. Klik "Start Session" → Halaman Kalibrasi
3. Sistem memuat MediaPipe model → Loading state
4. User memberikan izin kamera → Vision Feed aktif
5. User melakukan kalibrasi:
   - Pengecekan pencahayaan (Lux ≥ 50)
   - Pengecekan pose (≥ 20 landmark visible)
6. Klik "Continue to Combat" → Halaman Combat Game
7. Gameplay loop:
   - Target muncul di layar
   - User melakukan gesture (Punch/Squat/Horse Stance)
   - Sistem mendeteksi gesture → Hit/Miss
   - Score diupdate
   - Setiap 5 detik, data dikirim ke Gemini untuk feedback
   - AI Sensei memberikan feedback narasi
8. Timer habis → Auto redirect ke Halaman Session Summary
9. User melihat statistik sesi + leaderboard
10. Klik "Start Again" untuk sesi baru atau "Return Home" untuk kembali
```

---

## Catatan Penting

### Keamanan
- **Gemini API Key** disimpan di environment variable server-side (tidak diekspos ke client)
- **Data kamera** diproses client-side saja, tidak dikirim ke server
- **Auth token** disimpan di httpOnly cookie via Firebase Auth

### Performa
- Target ≥ 30 FPS untuk deteksi pose
- Target ≤ 2 detik untuk Gemini response
- Target ≤ 500ms untuk Firestore write latency

### Aksesibilitas
- WCAG AA contrast ratio (4.5:1 minimum)
- Voice command fallback via Web Speech API
- `prefers-reduced-motion` dihormati

### Offline Support
- Score tersimpan lokal (Zustand persist)
- Sync ke Firestore saat koneksi kembali
- Fallback feedback lokal saat Gemini error
