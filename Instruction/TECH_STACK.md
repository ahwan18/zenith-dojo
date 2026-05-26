# TECH STACK — Zenith: The Vision Master
### Web (React / TypeScript) · Google-Native Edition
> 🏆 **#JuaraVibeCoding Hackathon by Google**
> AI assistants and developers must use ONLY the libraries listed here unless explicitly approved.
> **Priority**: Google-first technology choices wherever possible.

---

## 1. Language & Runtime

| Item | Value |
|---|---|
| Language | TypeScript `5.x` (strict mode) |
| Runtime | Node.js `20 LTS` |
| Package Manager | `pnpm` (preferred) |
| Module System | ESModules (`"type": "module"`) |

---

## 2. Framework & Build

| Category | Tool | Version | Notes |
|---|---|---|---|
| UI Framework | React | `18.x` | |
| Build Tool | Vite | `5.x` | Dev only |
| Meta-Framework | **Next.js** | `14.x` (App Router) | **Required** — digunakan untuk Route Handlers (API key aman) |
| TypeScript Config | `tsconfig.json` strict | — | |

> ❌ Do NOT use Create React App.
> ✅ Gunakan Next.js App Router — Route Handlers digunakan untuk menyembunyikan Gemini API key dari client.

---

## 3. Google AI & ML Stack ⭐

> **Inti dari submission #JuaraVibeCoding** — semua AI/ML menggunakan ekosistem Google.

| Concern | Tool | Version | Notes |
|---|---|---|---|
| **Large Language Model** | **Gemini 3.0 Flash** | Latest | Via `@google/generative-ai` SDK |
| **Pose Detection** | **MediaPipe Pose** | `0.5.x` | Via `@mediapipe/tasks-vision` (WASM, client-side) |
| **Gemini Streaming** | `streamGenerateContent` | — | Untuk real-time feedback yang responsif |
| **Gemini Function Calling** | `tools` parameter | — | Untuk agentic AI Sensei (triggerCombo, adjustDifficulty) |
| **Google AI SDK** | `@google/generative-ai` | `0.x` | Official Google SDK |

### Gemini SDK Setup
```typescript
// app/api/sensei/analyze/route.ts (Next.js Route Handler — AMAN, API key di server)
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-3.0-flash",
  tools: senseiTools,          // Function Calling tools
  systemInstruction: SENSEI_SYSTEM_PROMPT,
});

// Streaming response
const result = await model.generateContentStream(prompt);
for await (const chunk of result.stream) {
  // stream ke client via ReadableStream
}
```

### MediaPipe Setup
```typescript
// Diinisialisasi di VisionProvider (client-side, WASM)
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const filesetResolver = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
);
const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
  baseOptions: {
    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
    delegate: "GPU",         // Gunakan GPU jika tersedia untuk performa
  },
  runningMode: "VIDEO",
  numPoses: 1,
});
```

> ❌ Do NOT use TensorFlow.js Pose Detection — gunakan MediaPipe (Google official).
> ❌ Do NOT use OpenAI / Anthropic API — gunakan Gemini.

---

## 4. Firebase (Google Backend) ⭐

| Service | SDK | Version | Penggunaan |
|---|---|---|---|
| **Firebase Authentication** | `firebase/auth` | `10.x` | Google Sign-In, session management |
| **Firestore** | `firebase/firestore` | `10.x` | Leaderboard, session stats, user profile |
| **Firebase Hosting** | Firebase CLI | `13.x` | Deployment untuk demo hackathon |
| **Firebase App Check** | `firebase/app-check` | `10.x` | Proteksi API endpoint dari abuse |

### Firebase Setup
```typescript
// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ...
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

> ❌ Never store JWT or auth tokens in localStorage — gunakan Firebase Auth SDK + httpOnly cookies.
> ✅ Firebase Hosting **wajib** digunakan untuk URL demo yang stabil saat presentasi.

---

## 5. Architecture & State Management

| Concern | Tool | Version | Notes |
|---|---|---|---|
| Server State / Data Fetching | TanStack Query | `5.x` | Gemini feedback, Firestore queries |
| Global Client State | Zustand | `4.x` | `currentScore`, `playerHealth`, `activeCombo`, `difficulty` |
| Persisted State | Zustand + `persist` middleware | `4.x` | High score lokal (offline fallback) |
| Local Component State | React `useState` / `useReducer` | Built-in | Kamera status, loading state |
| URL State | Next.js router / `useSearchParams` | `14.x` | Session ID, game mode |
| Form State | React Hook Form | `7.x` | Settings form |
| Form Validation | Zod | `3.x` | Schema validation input API |

> ❌ Do NOT use Redux.
> ❌ Do NOT use `useEffect` untuk data fetching — gunakan TanStack Query.
> ❌ Do NOT use localStorage untuk auth atau data sensitif.

---

## 6. Routing

| Category | Tool | Version |
|---|---|---|
| SSR / API Routes | Next.js App Router | `14.x` |
| Client Navigation | Next.js `<Link>` / `useRouter` | `14.x` |

> Route Handlers (`app/api/**`) **wajib** digunakan untuk semua call ke Gemini API agar API key tidak terekspos ke browser.

---

## 7. Styling

| Category | Tool | Version | Notes |
|---|---|---|---|
| CSS Approach | CSS Modules + CSS Custom Properties | — | |
| Font | **Google Fonts**: `Orbitron` + `Inter` | — | Via `next/font/google` (optimal loading) |
| Icons | `lucide-react` | `0.x` | |
| Animation | Framer Motion | `11.x` | Transisi state, efek partikel, feedback pulse |

```typescript
// app/layout.tsx — Google Fonts via next/font (optimal, no layout shift)
import { Orbitron, Inter } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
```

> ❌ Do NOT use inline styles untuk nilai statis.
> ❌ Do NOT load Google Fonts via `<link>` tag — gunakan `next/font/google`.

---

## 8. HTTP & API

| Category | Library | Version | Notes |
|---|---|---|---|
| HTTP Client | `axios` | `1.x` | Untuk call ke Next.js Route Handlers |
| API Mocking (dev/test) | `msw` (Mock Service Worker) | `2.x` | Mock Gemini response saat dev |
| Streaming | Native `ReadableStream` + `fetch` | Built-in | Untuk Gemini streaming response |
| Runtime Validation | `zod` | `3.x` | Validasi input ke `/api/sensei/analyze` |
| Gemini SDK | `@google/generative-ai` | `0.x` | Server-side only |

### Streaming Pattern (Gemini → Client)
```typescript
// app/api/sensei/analyze/route.ts
export async function POST(req: Request) {
  const { landmarkSummary } = await req.json();
  
  const stream = new ReadableStream({
    async start(controller) {
      const result = await model.generateContentStream(landmarkSummary);
      for await (const chunk of result.stream) {
        controller.enqueue(chunk.text());
      }
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" }
  });
}
```

> ❌ Do NOT call Gemini API directly dari client/browser — selalu lewat Next.js Route Handler.

---

## 9. Authentication

| Category | Library | Notes |
|---|---|---|
| Provider | **Firebase Authentication** | Google Sign-In (wajib untuk hackathon) |
| Session | `httpOnly` cookies (server) | Via Firebase Admin SDK di Route Handler |
| Token Storage | Server-side only | Never store in localStorage |
| Client SDK | `firebase/auth` `10.x` | Google OAuth popup / redirect |

---

## 10. Testing

| Category | Library | Version |
|---|---|---|
| Unit Testing | Vitest | `1.x` |
| Component Testing | React Testing Library | `14.x` |
| E2E Testing | Playwright | `1.x` |
| API Mocking in Tests | `msw` | `2.x` |

> ❌ Do NOT use Enzyme.
> ✅ Mock MediaPipe dan Gemini API di unit tests menggunakan `msw`.

---

## 11. Code Quality

| Tool | Purpose | Config File |
|---|---|---|
| ESLint | Linting | `.eslintrc.json` |
| Prettier | Formatting | `.prettierrc` |
| TypeScript | Type checking (strict) | `tsconfig.json` |
| Husky + lint-staged | Pre-commit hooks | `.husky/` |

---

## 12. Observability & Monitoring

| Category | Library | Version |
|---|---|---|
| Error Tracking | Sentry | `7.x` |
| Web Vitals | `web-vitals` | `3.x` |
| Analytics | **Firebase Analytics** | `10.x` |
| Performance Profiling | `performance.now()` (built-in) | — |

> ❌ Never leave `console.log` in production code — gunakan Sentry breadcrumbs.
> ✅ Firebase Analytics digunakan untuk melacak `session_start`, `gesture_detected`, `sensei_feedback_received`.

---

## 13. CI/CD & Deployment

| Tool | Purpose | Notes |
|---|---|---|
| GitHub Actions | CI pipeline (lint, test, build) | |
| **Firebase Hosting** | Primary deployment | **Wajib** untuk demo URL yang stabil |
| Vercel | Alternative/preview deployments | Opsional |

### Firebase Hosting Deploy
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Init hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

---

## 14. Environment Variables

```env
# .env.local (JANGAN commit ke Git)

# Gemini (server-side only — TIDAK ada NEXT_PUBLIC_ prefix)
GEMINI_API_KEY=your_gemini_api_key

# Firebase (client-safe, prefix NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin (server-side only)
FIREBASE_ADMIN_PRIVATE_KEY=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
```

> ❌ GEMINI_API_KEY **tidak boleh** memiliki `NEXT_PUBLIC_` prefix — ini akan mengekspos API key ke browser.

---

## 15. Approved npm Packages

| Package | Purpose | Version | Google? |
|---|---|---|---|
| `react` | UI framework | `18.x` | |
| `react-dom` | DOM rendering | `18.x` | |
| `next` | Meta-framework + API Routes | `14.x` | |
| `@google/generative-ai` | Gemini AI SDK | `0.x` | ⭐ Google |
| `@mediapipe/tasks-vision` | MediaPipe Pose detection | `0.5.x` | ⭐ Google |
| `firebase` | Firebase SDK (Auth + Firestore) | `10.x` | ⭐ Google |
| `firebase-admin` | Firebase Admin SDK (server) | `12.x` | ⭐ Google |
| `@tanstack/react-query` | Server state management | `5.x` | |
| `zustand` | Global client state | `4.x` | |
| `react-hook-form` | Form state | `7.x` | |
| `zod` | Schema validation | `3.x` | |
| `axios` | HTTP client | `1.x` | |
| `framer-motion` | Animations | `11.x` | |
| `lucide-react` | Icons | `0.x` | |
| `msw` | API mocking (dev/test) | `2.x` | |
| `@sentry/nextjs` | Error tracking | `7.x` | |
| `web-vitals` | Performance metrics | `3.x` | |

> ⚠️ Package apapun yang tidak ada di list ini memerlukan persetujuan tim sebelum digunakan.
> ⭐ = Google technology — diutamakan untuk submission #JuaraVibeCoding.

---

## 16. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS APP (14.x)                      │
├──────────────────────────┬──────────────────────────────────┤
│        CLIENT SIDE       │         SERVER SIDE              │
│    (React + TypeScript)  │      (Route Handlers)            │
│                          │                                  │
│  ┌─────────────────┐     │  ┌──────────────────────────┐   │
│  │ VisionProvider  │     │  │  /api/sensei/analyze     │   │
│  │ (MediaPipe WASM)│     │  │  → Gemini 3.0 Flash      │   │
│  └────────┬────────┘     │  │  → Function Calling      │   │
│           │              │  │  → Streaming Response    │   │
│  ┌────────▼────────┐     │  └──────────────────────────┘   │
│  │ useMovementLogic│     │                                  │
│  │ (Zustand Store) │     │  ┌──────────────────────────┐   │
│  └────────┬────────┘     │  │  /api/session/save       │   │
│           │              │  │  → Firebase Firestore    │   │
│  ┌────────▼────────┐     │  └──────────────────────────┘   │
│  │ useSenseiQuery  ├─────►                                  │
│  │ (TanStack Query)│     │  Firebase Authentication         │
│  └─────────────────┘     │  (Google Sign-In)                │
└──────────────────────────┴──────────────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │        GOOGLE CLOUD            │
                    │  Gemini 3.0 Flash              │
                    │  Firebase Firestore            │
                    │  Firebase Auth                 │
                    │  Firebase Hosting (deploy)     │
                    └───────────────────────────────┘
```
