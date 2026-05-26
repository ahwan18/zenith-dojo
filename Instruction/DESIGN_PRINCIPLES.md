# DESIGN PRINCIPLES — Web (React / TypeScript)

## 1. Engineering Philosophy
Our engineering philosophy prioritizes:
- **Maintainability over cleverness**
- **Readability over brevity**
- **Scalability through simplicity**
- **Consistency across the codebase**

All React/TypeScript code should be written with the expectation that another developer will read, modify, and extend it.

---

## 2. SOLID Principles

### 2.1 Single Responsibility Principle (SRP)
- Each component, hook, or utility should have **one reason to change**.
- Separate UI rendering, business logic, and data fetching into distinct layers.
- Example: A `UserCard` component should not contain API calls — delegate that to a custom hook `useUser()`.

### 2.2 Open-Closed Principle (OCP)
- Components should be **open for extension via props/composition, closed for internal modification**.
- Use `children`, `render props`, or compound component patterns to extend behavior.
- Prefer composing components over modifying existing ones.

### 2.3 Liskov Substitution Principle (LSP)
- A component that extends another (via HOC or wrapper) must not break the behavior expected by the parent.
- Custom form inputs should behave consistently with native HTML inputs.

### 2.4 Interface Segregation Principle (ISP)
- Keep prop interfaces **small and focused**.
- Do not pass unnecessary props through components.
- Split large prop interfaces into smaller, composable ones.

### 2.5 Dependency Inversion Principle (DIP)
- Components and hooks should depend on **abstractions** (interfaces, context, injection), not concrete implementations.
- Example: Inject an API client via React Context rather than importing it directly inside a component.

---

## 3. DRY (Don't Repeat Yourself)
- Extract repeated UI patterns into shared components in `/components/common/`.
- Extract repeated logic into custom hooks in `/hooks/`.
- Centralize design tokens (colors, spacing, typography) in a theme file or CSS variables.

---

## 4. KISS (Keep It Simple, Stupid)
- Favor simple, flat component trees over deeply nested structures.
- Avoid over-abstracting until the need is proven (2–3 repetitions minimum).
- If a component requires excessive explanation, break it into smaller, named sub-components.

---

## 5. YAGNI (You Aren't Gonna Need It)
- Do not build generic utilities or abstractions speculatively.
- Avoid prop interfaces with optional fields "just in case."
- Focus on current feature requirements, not hypothetical future use cases.

---

## 6. Clean Code Heuristics

### 6.1 Naming Conventions
- **Components**: `PascalCase` (e.g., `UserProfileCard`)
- **Hooks**: `camelCase` prefixed with `use` (e.g., `useAuthSession`)
- **Utilities**: `camelCase` (e.g., `formatCurrency`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- **Types/Interfaces**: `PascalCase` prefixed with `I` for interfaces or `T` for types if needed (e.g., `UserProfile`, `IAuthContext`)
- Use descriptive, intention-revealing names — avoid abbreviations.

### 6.2 Component Design
- Components should:
  - Be **small and focused** (ideally < 150 lines)
  - Render **one logical unit** of UI
  - Accept only the props they need
- Avoid inline function definitions in JSX that cause unnecessary re-renders; use `useCallback` where appropriate.

### 6.3 Comments Philosophy
- Code should be **self-explanatory**.
- Use JSDoc comments for exported hooks, utilities, and types.
- Explain *why*, not *what* — especially for non-obvious logic.

### 6.4 Error Handling
- Use **Error Boundaries** to catch and display UI errors gracefully.
- Handle async errors explicitly with `try/catch` or `.catch()`.
- Provide user-facing error messages via a global notification/toast system.
- Never silently swallow errors.

### 6.5 Code Formatting
- Use **ESLint** + **Prettier** configured at project root.
- Maximum line length: **100 characters**.
- Run formatting on save (configure in `.vscode/settings.json`).

---

## 7. React-Specific Guidelines
- Prefer **functional components** with hooks — no class components.
- Always define **TypeScript prop types** for every component.
- Use `React.memo` only when profiling proves a re-render problem.
- Avoid `useEffect` for data fetching; prefer React Query, SWR, or server components.
- Do not mutate state directly — always return new objects/arrays.

---

## 8. Testing Mindset
- Write unit tests for all custom hooks and utility functions using **Vitest** or **Jest**.
- Write component tests using **React Testing Library** — test behavior, not implementation.
- Write E2E tests for critical flows using **Playwright** or **Cypress**.
- Aim for fast, deterministic, isolated tests.

---

## 9. Consistency Over Preference
- Follow established project conventions (folder structure, naming, state management) even if personal preference differs.
- Consistency improves team velocity and long-term maintainability.
