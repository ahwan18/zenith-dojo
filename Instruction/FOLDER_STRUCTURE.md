# FOLDER STRUCTURE — Web (React / TypeScript)

> This file defines the canonical folder and file organization for this React project.
> AI assistants must always place new files in the correct location as defined here.

---

## 1. Top-Level Project Structure

```
project-root/
├── src/                          # All application source code
├── public/                       # Static assets (favicon, robots.txt)
├── docs/                         # Documentation, ADRs
├── .github/                      # GitHub Actions CI workflows
├── index.html                    # Vite entry (or handled by Next.js)
├── vite.config.ts                # Build config
├── tsconfig.json                 # TypeScript config
├── .eslintrc.json                # ESLint config
├── .prettierrc                   # Prettier config
└── package.json
```

---

## 2. Source Directory

```
src/
├── app/                          # App wiring: router, providers, global layout
├── features/                     # Feature modules (vertical slicing)
├── shared/                       # Truly global reusable code
├── lib/                          # Third-party library configuration
├── styles/                       # Global CSS, design tokens
└── constants/                    # App-wide constants
```

---

## 3. App Layer

```
src/app/
├── App.tsx                       # Root component
├── router.tsx                    # Centralized route definitions
├── providers.tsx                 # Global providers (QueryClient, Theme, Auth)
└── layouts/
    ├── RootLayout.tsx
    ├── AuthLayout.tsx
    └── DashboardLayout.tsx
```

---

## 4. Features Layer (Vertical Slicing)

Each feature is fully self-contained:

```
src/features/
└── featureName/
    ├── components/               # Feature-specific React components
    │   ├── FeatureCard.tsx
    │   └── FeatureList.tsx
    ├── hooks/                    # Feature-specific custom hooks
    │   └── useFeatureName.ts
    ├── api/                      # API functions + React Query hooks
    │   ├── featureNameApi.ts     # Raw API call functions
    │   └── useFeatureNameQuery.ts # TanStack Query hooks
    ├── stores/                   # Feature-specific Zustand slices (if needed)
    │   └── featureNameStore.ts
    ├── types/                    # TypeScript types/interfaces for this feature
    │   └── featureName.types.ts
    ├── utils/                    # Feature-specific utilities
    │   └── featureNameHelpers.ts
    └── index.ts                  # Public API — only export what other features need
```

### Example: Auth Feature

```
src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── SignUpForm.tsx
│   └── SocialLoginButtons.tsx
├── hooks/
│   └── useAuthSession.ts
├── api/
│   ├── authApi.ts
│   └── useAuthMutation.ts
├── types/
│   └── auth.types.ts
└── index.ts
```

---

## 5. Shared Layer

```
src/shared/
├── components/                   # Globally reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   └── Button.stories.tsx
│   ├── Modal/
│   ├── Toast/
│   └── Spinner/
├── hooks/                        # Globally reusable hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── usePagination.ts
├── utils/                        # Pure utility functions
│   ├── formatDate.ts
│   ├── formatCurrency.ts
│   └── cn.ts                     # Class name utility
└── types/                        # Shared TypeScript types
    ├── api.types.ts              # Generic API response types
    └── common.types.ts
```

---

## 6. Lib Layer

```
src/lib/
├── apiClient.ts                  # Axios instance + interceptors
├── queryClient.ts                # TanStack Query client config
└── sentry.ts                     # Sentry initialization
```

---

## 7. Styles Layer

```
src/styles/
├── globals.css                   # CSS reset + global styles
├── tokens.css                    # CSS Custom Properties (design tokens)
└── typography.css                # Global typography rules
```

---

## 8. Tests Structure

Tests live co-located next to the source files:

```
src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── LoginForm.test.tsx        # Co-located component test
├── hooks/
│   ├── useAuthSession.ts
│   └── useAuthSession.test.ts    # Co-located hook test
```

E2E tests live in a separate top-level folder:

```
e2e/
├── auth.spec.ts
└── checkout.spec.ts
```

---

## 9. File Naming Rules

| Item | Convention | Example |
|---|---|---|
| React Component | `PascalCase.tsx` | `UserProfileCard.tsx` |
| Custom Hook | `camelCase` prefixed `use` | `useAuthSession.ts` |
| API Function | `camelCase` + `Api` suffix | `userApi.ts` |
| Query Hook | `camelCase` + `Query/Mutation` | `useUserQuery.ts` |
| Types File | `camelCase.types.ts` | `auth.types.ts` |
| Utility | `camelCase.ts` | `formatDate.ts` |
| Store | `camelCase` + `Store` | `cartStore.ts` |
| CSS Module | Same as component, `.module.css` | `Button.module.css` |
| Test File | Same as source + `.test.tsx` | `LoginForm.test.tsx` |
| E2E Test | Feature name + `.spec.ts` | `auth.spec.ts` |
| Constants | `camelCase` or `UPPER_SNAKE_CASE` | `appConstants.ts` |

---

## 10. Rules

- ✅ One component per file
- ✅ Feature folders are self-contained — cross-feature imports go through `index.ts` only
- ✅ `shared/` contains only dependency-free, reusable code
- ✅ All exported items from a feature go through `features/featureName/index.ts`
- ❌ Do NOT import from `features/featureA/` inside `features/featureB/` directly
- ❌ Do NOT place business logic inside component files — put in hooks or api layer
- ❌ Do NOT create a component in `shared/` that depends on a specific feature
- ❌ Do NOT use default exports for anything other than page/route components
