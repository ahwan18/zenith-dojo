# DESIGN.md — Zenith Dojo Design System & UI Manual

## 1. Design Philosophy: Futuristic Dark Dojo

Zenith Dojo is built with a highly immersive, premium **Futuristic Dark Dojo** aesthetic (also described as *Soft Futuristic + Playful Minimalism*). It marries high-performance athletic visual design with clean, state-of-the-art gaming HUDs and ambient AI integrations. 

### Core Experiential Goals:
- **Calm Gaming / Focused Fitness:** No flashing neon cyberpunk sensory overload. The experience should feel like a premium, dedicated physical training sanctuary.
- **Premium Organic Tactility:** Interface panels feel like glowing translucent slabs floating in a dark, atmospheric dojo space.
- **Dynamic Human-Centered Design:** Every interactive movement is met with immediate, high-fidelity responsive animations and micro-indicators.

---

## 2. Color System: The Curated Palettes

The UI uses three distinct, overlapping color systems to define states, alerts, and aesthetic zones. 

### 2.1 CSS Variables / Global Tokens (`src/styles/tokens.css`)
These define core spacing, sizing, and standard light-level variable backups:
```css
:root {
  --app-bg-primary: #e6f0ea;       /* Base soft grayish green background */
  --app-bg-card: #f8f8f6;          /* Standard light mode card background */
  --app-accent-primary: #f4c95d;   /* Core bright gold highlight */
  --app-accent-secondary: #f28f8f; /* Alert red */
  --app-accent-blue: #7dc7d9;      /* Action/vision blue */
  --app-accent-purple: #c6a0f6;    /* Combo purple */
  --app-accent-green: #7bc29c;     /* Success green */
  --app-text-primary: #2a2a2a;     /* Deep dark text */
  --app-text-secondary: #7a7a7a;   /* Muted gray text */
  --app-border-subtle: rgba(0, 0, 0, 0.06);
}
```

### 2.2 The Canonical Dark Dojo Palette (`src/shared/components/ZenithShell/ZenithShell.module.css`)
This is the **primary production theme** utilized for general screens, navigation chrome, and page bodies:
```css
.page {
  --dojo-bg: #131313;                    /* Pitch black carbon base background */
  --dojo-bg-overlay: rgba(19, 19, 19, 0.92); /* Translucent navigation header overlay */
  --dojo-border: #4d4732;                /* Elegant earthy-bronze card/grid borders */
  --dojo-gold: #e9c400;                  /* Main glowing gold highlight */
  --dojo-gold-bright: #ffd700;           /* Vivid gold hover state highlight */
  --dojo-title: #e5e2e1;                 /* Pure crisp titanium for primary headers */
  --dojo-card: #2a2a2a;                  /* Muted high-contrast card background */
  --dojo-lavender: #d2bcfb;              /* Smart AI interaction & combo highlight */
  --dojo-caption: #d0c6ab;               /* Earthy gray-cream for descriptions and meta text */
  --dojo-icon-bg: #4f3d73;               /* Muted rich purple for secondary badges */
  --dojo-footer: rgba(208, 198, 171, 0.5); /* Faded sand cream for footers */
  --dojo-cream: #fff6df;                 /* Soft premium off-white for headers and text cards */
}
```

### 2.3 Interactive HUD & Session States (`src/app/session/sessionPage.module.css`, `combatSessionLayout.module.css`)
Used in high-intensity active views (active combat HUDs, results sheets):
- **Teal / Cyan (`#12f0ff`):** Used for absolute numbers, performance percentages, timers, and accuracy gauges.
- **Miss Red / Critical (`#ffb4ab`):** Soft salmon red used to denote misses, critical indicators, and the destructive "End Session" action.
- **Dynamic Scenes (`src/features/story/scenes.ts`):** Dynamic canvas backgrounds driven by story progression overlay soft gradients or ambient hues on the video feed.

---

## 3. Typographic Rules

Typography must strictly follow a high-contrast structural hierarchy using two web fonts:

### 3.1 Headings: Orbitron
- **Font Family:** `var(--font-orbitron)`, `sans-serif`
- **Application:** Page titles, card headers, massive scoring numbers, main menu links, brand logo.
- **Styling Attributes:**
  - Font weight: **700** or **800** (Heavy / Bold)
  - Letter-spacing: **-0.02em** to **0.05em**
  - Text-transform: **uppercase** (Mandatory for headers and branding)
  - Text-shadow: Subtle ambient glows (e.g. `0 0 7.5px rgba(255, 215, 0, 0.3)`)

### 3.2 Body & Interface Labels: Inter
- **Font Family:** `var(--font-inter)`, `system-ui`, `sans-serif`
- **Application:** Subtitles, descriptive copy, HUD metric labels, button labels.
- **Styling Attributes:**
  - Font weights: **400** (regular body text), **600** (semibold buttons, metadata), **700** (bold labels).
  - Line-height: **1.55** to **1.6** for extreme readability on dark backdrops.

---

## 4. Layout Architecture Blueprints

When building new interfaces, you **must** structure layouts inside modular containers utilizing the following CSS classes and responsive patterns:

### 4.1 Global Page Chrome: `ZenithShell`
Every standalone interface module (landing, mode-select, calibration, profiles) must inherit the `<ZenithShell>` structure to provide a consistent background environment:
```tsx
import { ZenithShell } from "@/shared/components/ZenithShell/ZenithShell";

export default function NewPage() {
  return (
    <ZenithShell>
      <main className={styles.main}>
        {/* Page Content */}
      </main>
    </ZenithShell>
  );
}
```
- **Ambient Lighting Background:** The `<ZenithShell>` includes an overlay component `.bgTexture` that applies a three-layer backdrop:
  1. Top-centered amber glow: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(233, 196, 0, 0.08) 0%, transparent 55%)`
  2. Bottom-right lavender glow: `radial-gradient(ellipse 60% 40% at 80% 100%, rgba(210, 188, 251, 0.06) 0%, transparent 50%)`
  3. Base linear dark gradient: `linear-gradient(180deg, #1a1a1a 0%, var(--dojo-bg) 45%, #0d0d0d 100%)`

### 4.2 Split-Panel Layouts (Active HUD Views)
For high-density training screens, use a three-column split-panel configuration.
- **Desktop Template:** Left-aligned stats panel, Center immersive target feed, and Right-aligned scoreboards:
  `grid-template-columns: minmax(260px, 320px) minmax(0, 1fr) minmax(260px, 320px)`
- **Mobile Stack Flow:** At viewports smaller than `1100px`, the columns shift order smoothly using CSS flex/grid orders:
  1. Immersive Center View (`order: 1`, occupies ~52vh)
  2. Left Panel HUD (`order: 2`)
  3. Right Panel HUD (`order: 3`)

---

## 5. UI Components & Glassy Containers

To create premium, tactually satisfying containers, follow these implementation codebases:

### 5.1 The Premium Dojo Card (`src/shared/components/Card`)
Cards represent individual data clusters. They feature clean borders, micro-elevation, and generous padding:
```css
.card {
  background: var(--app-bg-card); /* Light fallback or styled as deep dark transparent */
  border-radius: var(--app-radius-card); /* 28px */
  border: 1px solid var(--app-border-subtle);
  box-shadow: var(--app-shadow-floating); /* 0 10px 40px rgba(0, 0, 0, 0.06) */
  padding: var(--app-spacing-lg); /* 24px */
}
```
For **Dark Dojo Mode cards** (such as mode selectors), apply inset lighting highlights:
```css
.modeCard {
  background-color: #1c1b1b;
  box-shadow: 
    inset 1px 1px 0 0 rgba(255, 255, 255, 0.05),
    inset -1px -1px 0 0 rgba(0, 0, 0, 0.5);
  border-radius: 0px; /* High-contrast clean rectangular block edges */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
```

### 5.2 Buttons & Navigation Links (`src/shared/components/Button`)
Buttons must utilize custom rounded boundaries and responsive scales:
- **Border Radius:** `20px` (`var(--app-radius-button)`)
- **Primary Action (Gold Gradient):**
  `background: linear-gradient(180deg, #ffe6a0 0%, var(--app-accent-primary) 100%); color: #1f1f1f;`
- **Secondary Action (Pastel Overlay):**
  `background: var(--app-bg-card); color: var(--app-text-primary);`
- **Ghost Actions (Translucent Borders):**
  `border: 2px solid var(--dojo-border); background: transparent; color: var(--dojo-cream);`
- **Hover Transitions:** Smooth spring transitions that trigger a brief scale-up and drop-shadow glow.

---

## 6. Target Spawning System & Pose Overlays

The game engine renders targets overlays directly in the mirrored Web Camera feed:

### 6.1 Interactive Targets
- **Target Mirroring:** The camera stream is mirrored via CSS (`transform: scaleX(-1)`), so all target positions ($X$) generated by the engine must be mathematically mirrored in code before rendering:
  `left: {Math.round((1 - target.x) * 100)}%`
- **Aesthetic Attributes (Classic Target):** Uses a radiant 3D gradient bubble:
  `background: radial-gradient(circle at 30% 30%, #ffffff 0%, rgba(244, 201, 93, 0.9) 45%, rgba(244, 201, 93, 0.65) 100%)`
- **Aesthetic Attributes (AR Immersive Target):** Features a glowing ring:
  `background: radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.35) 0%, rgba(210, 188, 251, 0.22) 38%, rgba(233, 196, 0, 0.12) 100%)` with a border highlight `2px solid rgba(233, 196, 0, 0.65)`.
- **Target Zones & Icons:** Target indicators must visually communicate the required action using designated Lucide Icons:
  - **HEAD:** `<CircleDot>`
  - **HAND (Punch):** `<Hand>`
  - **FOOT (Kick/Stance):** `<Footprints>`
  - **CHEST:** `<User>`

### 6.2 Pose Skeleton Overlay (`src/features/vision/components/PoseCanvas.tsx`)
The skeleton overlay renders dynamic tracking lines connecting 12 vital body joints:
- **Skeleton Dots (Joints):** Drawn with `rgba(125, 199, 217, 0.9)` (Vision/Teal Accent) with a radius of `4px`.
- **Skeleton Bones (Connections):** Rendered with a solid stroke width of `2px` using `rgba(123, 194, 156, 0.9)` (Success/Green Accent).

---

## 7. Motion & Animation Standards

Interface dynamics must feel responsive, organic, and premium. Use `framer-motion` for all element transitions.

### 7.1 Presets & Physics
- **Snappy / Active (Spring):** For modals, spawned targets, stats, and gesture logs:
  `type: "spring", stiffness: 320, damping: 28`
- **Gentle / Cinematic (Ease):** For page entries, story narration texts, and results dashboards:
  `transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }`
- **Reduced Motion Support:** Always check user system preferences and bypass translations/scaling if active:
  ```typescript
  import { useReducedMotion } from "framer-motion";
  const reduceMotion = useReducedMotion();
  // Bypass or mute anims if true
  ```

---

## 8. DOs and DON'Ts Checklist for Creating New Pages

Follow this strict developer hygiene checklist when creating new views or panels:

### DO:
- [ ] **DO** wrap the layout in `<ZenithShell>` to inherit the background texture gradients.
- [ ] **DO** use Orbitron uppercase for primary layout headings and Inter for body details.
- [ ] **DO** write styles inside CSS Modules (`[Component].module.css`) to enforce scoped CSS architecture.
- [ ] **DO** verify camera scale symmetry (ensure coordinate system matches mirrored visuals).
- [ ] **DO** leverage compound framer-motion loops (like breathing glows) on high-value game indicators.
- [ ] **DO** use semantic HTML tags (`<main>`, `<header>`, `<footer`, `<section>`, `<aside>`).

### DON'T:
- [ ] **DON'T** use TailwindCSS classes. Write vanilla CSS inside CSS Modules.
- [ ] **DON'T** mix sharp borders and raw neon colors. Stick to earthy-bronze card outlines (`--dojo-border`) and soft amber/lavender/teal accents.
- [ ] **DON'T** hardcode positions in pixels. Use percentage bounds (`%`) and flexible viewport grids (`clamp()`, `minmax()`) for seamless responsive layouts.
- [ ] **DON'T** overcrowd panels. Maintain ample white space, keeping text labels clean and lightweight.
- [ ] **DON'T** define absolute sizes on HUD assets without responsive flex/grid wrappers.
- [ ] **DON'T** drop support for standard accessibility outlines when interactive links receive active focus (`focus-visible`).

