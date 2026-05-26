# ARCHITECTURE GUIDELINES — Web (React / TypeScript)

## 1. Core Principles

### 1.1 Separation of Concerns (SoC)
- Divide the app into distinct layers:
  - **Presentation**: React components, pages
  - **Application Logic**: Custom hooks, context, state management
  - **Data Access**: API clients, query functions, repositories
- Each layer should have a **clear, single responsibility**.

### 1.2 Modular Design
- Organize code by **feature** (vertical slicing), not by type (horizontal slicing).
- Each feature module is self-contained with its own components, hooks, types, and API calls.
- Shared code lives in `src/shared/` or `src/common/`.

### 1.3 High Cohesion, Low Coupling
- Feature modules should **not import from each other** directly.
- Cross-feature communication happens via shared state, context, or URL params.

---

## 2. Recommended Folder Structure

```
src/
├── app/                  # App entry, routing, global providers
├── features/
│   └── featureName/
│       ├── components/   # Feature-specific UI components
│       ├── hooks/        # Feature-specific custom hooks
│       ├── api/          # API functions / React Query hooks
│       ├── types/        # TypeScript types/interfaces
│       └── utils/        # Feature-specific utilities
├── shared/
│   ├── components/       # Globally reusable UI components
│   ├── hooks/            # Globally reusable hooks
│   ├── utils/            # Globally reusable utilities
│   └── types/            # Shared TypeScript types
├── lib/                  # Third-party library config (axios, react-query, etc.)
├── styles/               # Global CSS, theme tokens
└── constants/            # App-wide constants
```

Rules:
- `features/` modules are **isolated** — no cross-feature imports.
- `shared/` contains only truly reusable, dependency-free code.
- `app/` wires everything together (routing, providers, layout).

---

## 3. Data Flow Principles

- Data flows **unidirectionally**: User Action → State Update → Re-render.
- Avoid prop drilling beyond 2 levels — use Context or state management.
- All server state managed via **React Query** (or SWR); avoid manual `useEffect` for fetching.
- All client state managed via **Zustand** / **Context** / `useState` as appropriate.

### 3.1 State Management Strategy

| State Type | Recommended Tool |
|---|---|
| Server / async data | React Query / SWR |
| Global UI state | Zustand / Context |
| Local component state | `useState` / `useReducer` |
| URL-driven state | Search params / router state |

- Avoid putting server data in global client state — React Query is the cache.
- Avoid overusing Context — it re-renders all consumers on every change.

---

## 4. Dependency Management

### 4.1 Rules
- All dependencies managed via `npm` / `yarn` / `pnpm` with a lockfile committed.
- Every new dependency must be:
  - Actively maintained (check last release date)
  - Justified (prefer native browser APIs or React built-ins first)
  - Version-pinned in `package.json`

### 4.2 Aliasing
- Use path aliases (e.g., `@/features/auth`) configured in `tsconfig.json`.
- Avoid long relative import paths (`../../../../shared/utils`).

---

## 5. API and Contract Design

- Define all API response shapes as TypeScript interfaces in `features/*/types/`.
- Use **Zod** for runtime validation of API responses at the boundary.
- Centralize API base URL and headers in `lib/apiClient.ts`.
- All API errors must be caught and normalized into a consistent error shape.

---

## 6. Routing Architecture

- Use **React Router v6** (or Next.js App Router for SSR projects).
- Define all routes in a centralized `app/routes.tsx` or `app/router.tsx`.
- Use **lazy loading** (`React.lazy` + `Suspense`) for all route-level components.
- Protect authenticated routes via a `<ProtectedRoute>` wrapper component.

---

## 7. Error Handling Strategy

- Implement **Error Boundaries** at the route level and around critical UI sections.
- Standardize API error shape: `{ message: string; code: string; status: number }`.
- Display user-facing errors via a global **Toast / Notification** system.
- Log errors to an observability service (e.g., Sentry) in production.

---

## 8. Performance Guidelines

- Use **React.memo** and `useMemo` / `useCallback` only after profiling.
- Code-split all routes using `React.lazy`.
- Optimize images: use WebP format, correct dimensions, lazy loading.
- Avoid unnecessary re-renders: normalize state shape, split large contexts.
- Use **Lighthouse** and **React DevTools Profiler** to measure, not guess.

---

## 9. Accessibility (a11y)

- All interactive elements must be keyboard navigable.
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<section>`).
- All images must have meaningful `alt` attributes.
- Color contrast must meet **WCAG AA** minimum.
- Test with a screen reader before shipping UI features.

---

## 10. Security Considerations

- Never store sensitive data (tokens, secrets) in `localStorage` — prefer `httpOnly` cookies.
- Sanitize all user-generated content before rendering (prevent XSS).
- Use **Content Security Policy (CSP)** headers.
- Validate all inputs on the client **and** server — never trust client data alone.

---

## 11. Observability

- Integrate **Sentry** (or equivalent) for error tracking in production.
- Use **Web Vitals** reporting (`reportWebVitals`) for performance monitoring.
- Structure console logs by level (`console.error`, `console.warn`) — remove `console.log` before merging.

---

## 12. Documentation

- Document all shared components with **Storybook** stories.
- Use **JSDoc** for all exported hooks and utility functions.
- Record major architectural decisions in `docs/ADR/`.
