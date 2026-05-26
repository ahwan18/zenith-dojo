# CONTRIBUTING GUIDELINES — Web (React / TypeScript)

## 1. Introduction
Thank you for contributing. This document defines the standards and workflow for maintaining code quality and consistency across the React/TypeScript codebase.

---

## 2. Git Workflow

### 2.1 Branch Naming
- `feature/<short-description>`
- `bugfix/<short-description>`
- `hotfix/<short-description>`
- `chore/<short-description>`

Examples:
- `feature/user-authentication`
- `bugfix/dashboard-infinite-loop`
- `chore/upgrade-react-query-v5`

### 2.2 Branch Rules
- Never commit directly to `main` or `develop`.
- Always branch from the latest `develop`.
- Delete branches after merging.

---

## 3. Commit Message Convention

Follow **Conventional Commits**:

```
<type>: <short description>
```

Types:
- `feat`: New feature or component
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `chore`: Dependency updates, build config changes
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `style`: CSS / styling changes only
- `perf`: Performance improvements

Examples:
```
feat: add infinite scroll to product listing page
fix: resolve stale closure in useCart hook
style: update button hover state to match design system
```

---

## 4. Pull Request (PR) Process

### 4.1 Before Submitting PR
Ensure:
- Project builds without errors (`npm run build`)
- All tests pass (`npm run test`)
- ESLint and Prettier report zero errors (`npm run lint`)
- No `console.log` statements in production code
- No commented-out dead code
- No hardcoded strings, colors, or magic numbers

### 4.2 PR Checklist
- [ ] Code follows feature-based folder structure
- [ ] TypeScript — no `any` types used without justification
- [ ] Unit tests added/updated for hooks and utilities
- [ ] Component tests added for non-trivial components
- [ ] Storybook story added/updated for shared components
- [ ] No new ESLint disable comments without inline explanation
- [ ] Accessibility: keyboard navigable, semantic HTML, ARIA labels where needed
- [ ] Responsive: tested at mobile (375px), tablet (768px), desktop (1280px)
- [ ] PR reviewed by at least one peer
- [ ] Screenshots or screen recordings attached for UI changes

### 4.3 PR Description Template
```
## Summary
Brief description of what this PR does.

## Changes
- List of key changes

## Screenshots / Screen Recording
(Required for UI-related changes)

## Testing
- How to test this change locally
- Browsers/devices tested on

## Related Issue
Closes #<issue-number>
```

---

## 5. Code Review Guidelines

**Reviewers should:**
- Focus on correctness, performance, and accessibility
- Check for unnecessary re-renders or missing memoization
- Verify TypeScript types are accurate and not overridden
- Confirm test coverage is adequate for new logic

**Authors should:**
- Respond to all review comments
- Justify `any` types or disabled ESLint rules with comments
- Keep PRs focused — one feature or fix per PR

---

## 6. Testing Requirements

- All custom hooks must have unit tests.
- All utility functions must have unit tests.
- Non-trivial components must have React Testing Library tests.
- E2E tests (Playwright/Cypress) required for critical user flows.
- Tests must be:
  - **Deterministic** — no random behavior
  - **Isolated** — mock all external dependencies
  - **Fast** — no real API calls in unit/component tests

---

## 7. TypeScript Standards

- No usage of `any` without a documented justification comment.
- Always define prop types for every component using `interface` or `type`.
- Use `unknown` instead of `any` for values of indeterminate type.
- Enable and respect `strict: true` in `tsconfig.json`.
- Avoid type assertions (`as SomeType`) unless absolutely necessary.

---

## 8. CSS / Styling Standards

- Use CSS variables / design tokens for all colors, spacing, and typography.
- Do not hardcode color values directly in component styles.
- Follow BEM naming for CSS modules or agreed class naming convention.
- Avoid inline `style` props for anything other than truly dynamic values.

---

## 9. Documentation

- Update `README.md` for environment setup or config changes.
- Add Storybook stories for all new shared components.
- Record architectural decisions in `docs/ADR/`.
- Use JSDoc for all exported hooks and utility functions.

---

## 10. General Rules

- Keep PRs under **400 lines changed** where possible.
- Avoid mixing unrelated changes in one PR.
- Do not merge your own PR without at least one approval.
- Prioritize clarity — React is declarative enough; avoid over-abstraction.

---

## 11. Enforcement

Non-compliant PRs will be:
- Blocked by CI (type errors, lint errors, failing tests)
- Returned for revision with detailed review comments
- Escalated to tech lead if repeatedly non-compliant
