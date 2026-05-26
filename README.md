# 🥋 Zenith MotionQuest

A cinematic fusion of AI-driven storytelling and real-time body tracking. Transform your movements into power in a high-performance, web-based motion game.

## 🚀 Quick Start

### 1. Environment Setup
- **Node.js**: v18+
- **Dependencies**: `npm install`
- **Dev Server**: `npm run dev`

### 2. Required Environment Variables (`.env.local`)
You must set the following keys for the game to function:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous public key.
- `GEMINI_API_KEY`: Your Google AI Studio API key (for the AI Director).

### 3. Infrastructure Setup (Manual)
To enable high-performance tracking (SharedArrayBuffer), you must configure your hosting provider to send these headers:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

---

## 🛠 Manual Modifications & Additions

### 🔊 Sound Effects (Sfx)
The game engine is ready for sound triggers. To add audio, place `.mp3` or `.wav` files in `public/sounds/` with the following naming convention:
- `hit_normal.mp3`: Triggered on a standard target hit.
- `hit_fast.mp3`: Triggered on a "Fast Hit" (top 30% of duration).
- `miss.mp3`: Triggered when a target expires.
- `combo_up.mp3`: Triggered when a new multiplier level is reached.
- `session_start.mp3`: Cinematic sound when the game begins.

### 🖼 Assets & Scenes
Backgrounds are managed in `src/features/story/scenes.ts`. To add a new environment:
1. Place a high-res image in `public/assets/scenes/`.
2. Add the entry to the `SCENE_REGISTRY` with an `ambientColor` and `backgroundGradient` as fallbacks.

---

## 🤖 AI Director Content Guide

To generate the core cinematic experience, use these specific prompts with **Gemini 1.5 Flash** and **Midjourney/DALL-E**. This setup is designed for a 3-chapter progression: **The Awakening** $\rightarrow$ **The Mirror Trial** $\rightarrow$ **Celestial Ascension**.

### ✍️ Story Generation (Gemini 1.5 Flash)
Copy and paste this exact prompt to generate the session narrative:

> "You are the Zen Director for MotionQuest. Generate a 3-chapter combat session based on the theme: **'The Celestial Void Dojo'**.
> 
> **Narrative Requirements:**
> 1. **Opening Hook**: A mysterious, atmospheric introduction (2 sentences) about stepping into a temple floating in a galactic nebula.
> 2. **Chapter 1: The Awakening**:
>    - Objective: 'Awaken the Inner Flame'
>    - Narrative: Focus on finding balance and first strikes.
> 3. **Chapter 2: The Mirror Trial**:
>    - Objective: 'Shatter the Illusion'
>    - Narrative: Focus on precision and speed as the environment begins to glitch and shift.
> 4. **Chapter 3: Celestial Ascension**:
>    - Objective: 'Transcend the Void'
>    - Narrative: The climax. Extreme intensity, cosmic energy, and the final test of a master.
> 
> **Output Format**: You MUST respond ONLY with a JSON object:
> {
>   "theme": "Celestial Void Dojo",
>   "chapters": [
>     { "id": "chapter_1", "title": "The Awakening", "text": "..." },
>     { "id": "chapter_2", "title": "The Mirror Trial", "text": "..." },
>     { "id": "chapter_3", "title": "Celestial Ascension", "text": "..." }
>   ]
> }"

### 🎨 Visual Backgrounds (Midjourney/DALL-E)
Generate three distinct backgrounds to match the progression. Use these prompts:

**1. For Chapter 1 (The Awakening):**
> "A high-resolution cinematic background for a motion-capture game. A serene, floating Zen dojo platform in a deep indigo nebula. Soft white lanterns floating in the air. Minimalist Japanese architecture, Unreal Engine 5, 4K, wide shot, center area empty and clear for player visibility, atmospheric lighting, 16:9."

**2. For Chapter 2 (The Mirror Trial):**
> "A high-resolution cinematic background for a motion-capture game. The Celestial Void Dojo now fractured into floating crystalline shards. Shimmering mirrors reflecting a neon violet galaxy. Glitch art elements, surrealism, cinematic lighting, 4K, wide shot, center area empty and clear, 16:9."

**3. For Chapter 3 (Celestial Ascension):**
> "A high-resolution cinematic background for a motion-capture game. The peak of the Celestial Void. A golden mandala radiating light against a backdrop of exploding supernovas and cosmic dust. Divine, epic scale, gold and deep obsidian palette, Unreal Engine 5, 4K, wide shot, center area empty, 16:9."

---

## 📉 Technical Architecture
- **Frontend**: Next.js 14 (App Router)
- **State**: Zustand (Persisted)
- **Vision**: MediaPipe Pose Landmarker (running in a Web Worker for 60fps)
- **AI**: Google Gemini 1.5 Flash (Structured JSON output)
- **Backend**: Supabase (Auth & Session Leaderboards)
