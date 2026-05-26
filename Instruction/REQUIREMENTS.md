# REQUIREMENTS — Zenith: The Vision Master
### Core Gameplay & Agentic AI Sensei Integration
> 🏆 Submission: **#JuaraVibeCoding Hackathon by Google**
> Stack: React + TypeScript · Google AI Stack (Gemini, MediaPipe, Firebase)

---

## 1. Feature Title
**Vision-Based Combat System & Agentic AI Sensei** — Real-time pose detection via webcam as a game controller, powered by Google's AI & ML ecosystem.

---

## 2. Overview

Fitur utama ini mencakup dua pilar teknologi:

1. **Computer Vision Controller** — Deteksi pose tubuh secara real-time menggunakan **MediaPipe Pose** (Google) untuk mengontrol aksi dalam game Shadow Boxing/Martial Arts. Koordinat 33 landmark tubuh diterjemahkan menjadi input serangan, tangkisan, dan kuda-kuda.

2. **Agentic AI Sensei** — Integrasi **Gemini 3.0 Flash** (via Google AI SDK) sebagai instruktur adaptif yang menganalisis kualitas gerakan, memberikan feedback narasi dinamis, dan menyusun strategi pertarungan secara real-time.

---

## 3. User Story

```
As a sedentary developer or student,
I want to play an action game using my physical movements as the controller,
so that I can exercise and improve my posture while having a delightful gaming experience.
```

**Extended User Stories (Google-native flow):**

```
As a player,
I want the AI Sensei to remember my weak points across sessions (via Firestore),
so that training recommendations become more personalized over time.

As a player with limited mobility,
I want to use voice commands (via Web Speech API / Gemini Live),
so that I can still participate even if physical movement is restricted.
```

---

## 4. Acceptance Criteria

### Vision & Input
- [ ] Kamera aktif dan mendeteksi **33 landmark koordinat** tubuh menggunakan **MediaPipe Pose** dengan latensi deteksi < 100ms.
- [ ] Game merespons minimal 3 gesture: **"Punch"** (serangan), **"Squat"** (dodge), dan **"Horse Stance"** (power charge) sebagai input yang valid.
- [ ] Deteksi gesture mempertahankan **≥ 30 FPS** pada device mid-range (laptop Intel i5 / AMD Ryzen 5).
- [ ] Sistem menampilkan overlay skeleton real-time di atas feed kamera selama sesi kalibrasi.

### AI Sensei (Gemini)
- [ ] **Gemini 3.0 Flash** memberikan feedback narasi yang berbeda berdasarkan akurasi pose (Good / Fair / Poor).
- [ ] AI Sensei menggunakan **Gemini Function Calling** untuk memicu aksi in-game (e.g., `triggerCombo`, `adjustDifficulty`) berdasarkan analisis performa.
- [ ] Fallback feedback generik tersedia saat koneksi Gemini API lambat atau error (≤ 3 detik timeout).
- [ ] Response Gemini di-stream menggunakan `streamGenerateContent` untuk pengalaman yang responsif.

### Firebase & Data
- [ ] Skor dan statistik sesi (combo tertinggi, akurasi rata-rata) disimpan ke **Firestore** secara real-time.
- [ ] **Firebase Authentication** (Google Sign-In) digunakan untuk identifikasi pemain dan personalisasi.
- [ ] Data streaming kamera **tidak** disimpan ke server — hanya koordinat landmark yang dikirim ke Gemini.

### UI/UX
- [ ] Loading state dengan progress indicator ditampilkan saat inisialisasi model MediaPipe.
- [ ] UI stabil dan responsif pada resolusi **desktop (1280px+)** dan **tablet landscape (768px+)**.
- [ ] Skema warna memenuhi **WCAG AA** (contrast ratio ≥ 4.5:1) dengan elemen glow/neon yang tidak menurunkan keterbacaan teks.

---

## 5. Functional Requirements

### User Flow

```
1. User membuka aplikasi → Firebase Auth (Google Sign-In)
2. Sistem memuat MediaPipe Pose WASM model (dengan loading progress bar)
3. User memberikan izin kamera → Lux check via Canvas API
4. Fase Kalibrasi: Overlay siluet + panduan posisi berdiri
5. Game dimulai → Musuh muncul secara bertahap
6. Loop utama:
   a. MediaPipe mendeteksi pose → useMovementLogic mengklasifikasikan gesture
   b. Gesture dikirim ke game engine → kalkulasi damage/combo
   c. Setiap 5 detik, ringkasan koordinat dikirim ke Gemini (via TanStack Query mutation)
   d. Gemini merespons dengan feedback + optional Function Call (triggerCombo / adjustDifficulty)
   e. AI Sensei HUD menampilkan feedback (text + text-to-speech via Web Speech API)
7. Session end → statistik disimpan ke Firestore → leaderboard diperbarui
```

### API & Integration

| Endpoint / Integration | Deskripsi | Teknologi |
|---|---|---|
| `POST /api/sensei/analyze` | Mengirim ringkasan koordinat landmark → mendapatkan feedback + Function Call | **Gemini 3.0 Flash** via `@google/generative-ai` |
| `GET /api/leaderboard` | Mengambil top 10 skor dari Firestore | **Firebase Firestore** |
| `POST /api/session/save` | Menyimpan statistik akhir sesi | **Firebase Firestore** |
| Realtime Auth | Google Sign-In + session management | **Firebase Authentication** |
| Pose Detection | Real-time landmark detection dari feed kamera | **MediaPipe Pose** (WASM, client-side) |

### Gemini Integration Detail

```typescript
// System Prompt untuk AI Sensei
const SENSEI_SYSTEM_PROMPT = `
  You are Zenith Sensei, a wise and motivating martial arts instructor in a video game.
  Analyze the player's movement quality based on pose landmark data and respond with:
  1. A short, in-character motivational feedback (max 2 sentences, Bahasa Indonesia or English)
  2. Optionally, call a function to modify the game state.
  
  Tone: Wise, encouraging, occasionally dramatic.
`;

// Function Calling Tools
const senseiTools = [
  {
    functionDeclarations: [
      {
        name: "triggerCombo",
        description: "Activate a special combo animation when player executes a perfect sequence",
        parameters: { type: "OBJECT", properties: { comboName: { type: "STRING" } } }
      },
      {
        name: "adjustDifficulty",
        description: "Dynamically adjust enemy speed and health based on player performance",
        parameters: { type: "OBJECT", properties: { delta: { type: "NUMBER", description: "-1 (easier) to +1 (harder)" } } }
      }
    ]
  }
];
```

### Validation Rules

- Pencahayaan minimum: Lux score ≥ 50 (diukur via Canvas API pixel brightness average) sebelum sesi dimulai.
- Pose validity: Minimal 20 dari 33 landmark harus memiliki `visibility > 0.6` agar gesture dianggap valid.
- Cooldown antar gesture: minimum 300ms untuk mencegah false positive.

---

## 6. Non-Functional Requirements

| Kategori | Requirement | Target |
|---|---|---|
| **Performance** | FPS deteksi pose | ≥ 30 FPS (mid-range device) |
| **Performance** | Latency Gemini response | ≤ 2 detik (dengan streaming) |
| **Performance** | Firestore write latency | ≤ 500ms |
| **Accessibility** | Voice command fallback | Via Web Speech API |
| **Accessibility** | WCAG Contrast | AA (4.5:1 minimum) |
| **Security** | Kamera data | Diproses client-side, tidak dikirim ke server |
| **Security** | Gemini API Key | Disimpan di environment variable server-side (Next.js Route Handler), tidak diekspos ke client |
| **Security** | Auth token | httpOnly cookie via Firebase Auth server SDK |
| **Reliability** | Gemini fallback | Generic feedback jika API timeout > 3 detik |
| **Reliability** | Offline mode | Score tersimpan lokal (Zustand persist) dan di-sync saat online |

---

## 7. UI/UX Specifications

### Component States

| State | Deskripsi | Visual |
|---|---|---|
| `Initializing` | MediaPipe model loading | Progress bar + skeleton animation + tips teks |
| `Calibration` | User alignment phase | Siluet transparan overlay kamera + panduan teks |
| `Combat` | Main gameplay | HUD minimalis: HP bar, combo counter, energy bar, feed kamera (PiP) |
| `SenseiFeedback` | Feedback dari Gemini | Side panel semi-transparan dengan teks animasi (Framer Motion) |
| `SessionEnd` | Hasil akhir | Score summary + leaderboard + share button (Google OAuth share) |
| `Error` | Kamera / API error | Friendly error screen + troubleshooting guide |

### Design System

- **Tema**: Cyberpunk Dojo — dark background (`#0A0A0F`) dengan aksen neon biru/kuning.
- **Font**: `Google Fonts: Orbitron` (heading/score) + `Inter` (body/feedback text).
- **Animasi**: Framer Motion untuk transisi state, efek partikel saat combo, dan pulse feedback.
- **Aksesibilitas**: `prefers-reduced-motion` dihormati — matikan efek partikel jika user prefer no motion.

### Wireframe Flow

```
[Login] → [Calibration] → [Combat HUD] → [Session End]
              ↑                  ↓
         [Camera Error]    [Sensei Feedback Panel]
```

---

## 8. Component Breakdown

| Component | Type | Responsibility | Status |
|---|---|---|---|
| `VisionProvider` | Context Provider | Menginisialisasi MediaPipe, expose pose data ke tree | New |
| `PoseCanvas` | Core Component | Render kamera feed + landmark overlay | New |
| `SenseiHUD` | UI Component | Menampilkan feedback Gemini, combo counter, HP | New |
| `CombatArena` | Core Component | Game loop, enemy rendering, collision logic | New |
| `CalibrationOverlay` | UI Component | Siluet panduan + lux check UI | New |
| `SessionSummary` | UI Component | Score akhir + Firestore leaderboard | New |
| `useMovementLogic` | Custom Hook | Mengklasifikasikan gesture dari landmark data | New |
| `useSenseiQuery` | Custom Hook | TanStack Query mutation ke `/api/sensei/analyze` | New |
| `useGameState` | Zustand Store | `currentScore`, `playerHealth`, `activeCombo`, `difficulty` | New |

---

## 9. State Management

| State Type | Tool | Data |
|---|---|---|
| **Server state** | TanStack Query `5.x` | Gemini feedback, Firestore leaderboard |
| **Global client** | Zustand `4.x` | `currentScore`, `playerHealth`, `activeCombo`, `difficulty`, `sessionId` |
| **Local component** | React `useState` | Status akses kamera, loading model, lux check result |
| **Persisted state** | Zustand + `zustand/middleware/persist` | High score lokal (offline fallback) |
| **Auth state** | Firebase Auth SDK | User profile, UID, Google token |

---

## 10. Edge Cases

| Skenario | Handling |
|---|---|
| Kamera tidak terdeteksi / izin ditolak | Tampilkan panduan step-by-step cara mengaktifkan kamera di berbagai browser |
| Pemain keluar dari frame | Pause game otomatis + overlay "Out of Bounds! Kembali ke area" |
| Pencahayaan buruk (Lux < 50) | Warning sebelum mulai + tips pencahayaan |
| Koneksi Gemini API lambat / error | Gunakan fallback feedback array lokal, retry otomatis setelah 5 detik |
| Firebase offline | Simpan skor ke Zustand persist, sync saat koneksi kembali |
| Terlalu banyak gesture false positive | Implementasi gesture debounce (300ms) + confidence threshold (0.6) |
| Mobile portrait mode | Tampilkan prompt rotasi layar ke landscape |
| Gemini Function Call malformed | Catch + log ke Sentry, skip function execution, tampilkan teks feedback saja |

---

## 11. Google Technology Integration Map

```
┌─────────────────────────────────────────────────────────┐
│                    ZENITH: THE VISION MASTER            │
│                    #JuaraVibeCoding 2024                │
├─────────────────┬───────────────────┬───────────────────┤
│   CLIENT SIDE   │    NEXT.JS API    │   GOOGLE CLOUD    │
│                 │                   │                   │
│ MediaPipe Pose  │  /api/sensei      │  Gemini 3.0 Flash │
│ (WASM, local)   │  ──────────────► │  (Function Call + │
│                 │                   │   Streaming)      │
│ Firebase SDK    │  /api/session     │                   │
│ (Auth + Store)  │  ──────────────► │  Firebase         │
│                 │                   │  Firestore        │
│ Web Speech API  │                   │  Firebase Auth    │
│ (TTS feedback)  │                   │  (Google Sign-In) │
└─────────────────┴───────────────────┴───────────────────┘
```

---

## 12. Success Metrics

| Metric | Target | Cara Ukur |
|---|---|---|
| FPS Stabilitas | ≥ 30 FPS (mid-range device) | `performance.now()` profiling |
| Gesture Recognition Accuracy | ≥ 90% correct classification | Manual test set 50 gesture samples |
| Gemini Response Time | ≤ 2 detik (p95) | TanStack Query `meta.duration` logging |
| Session Engagement | Avg. > 5 menit per sesi | Firebase Analytics event tracking |
| Firebase Write Success Rate | ≥ 99% | Firestore error rate monitoring |
| Hackathon Judge Wow Factor | Memorable demo | Live demo dengan real-time AI narration |

---

## 13. Hackathon-Specific Notes

> Untuk **#JuaraVibeCoding**, pastikan:
> - Demo video menampilkan **Gemini Function Calling** secara eksplisit (bukan hanya text generation).
> - Slide deck menyebutkan semua Google technology yang digunakan.
> - README mencantumkan arsitektur diagram dan link ke Google AI SDK docs.
> - Deploy ke **Firebase Hosting** untuk URL demo yang stabil saat presentasi.
> - Simpan Gemini API key di **Google Secret Manager** atau environment variable Vercel/Firebase.
