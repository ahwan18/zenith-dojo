# NAMING CONVENTIONS — Web (React / TypeScript)

> This file defines strict naming rules for all React/TypeScript code.
> AI assistants must follow these conventions for every generated file, type, and symbol.

---

## 1. General Rules

- Names must be **descriptive and intention-revealing**.
- Avoid abbreviations unless universally understood (`URL`, `ID`, `API`, `HTTP`).
- Boolean variables and props should read as assertions: `isLoading`, `hasError`, `canSubmit`.
- ❌ Never use single-letter variable names except in simple `Array.map` callbacks.
- ❌ Never use `data`, `info`, `item`, `stuff` as variable names — be specific.

---

## 2. React Components

| Rule | Convention | ✅ Correct | ❌ Incorrect |
|---|---|---|---|
| All components | `PascalCase` | `UserProfileCard` | `userProfileCard`, `user_profile_card` |
| Page / Route components | `PascalCase` + `Page` suffix | `DashboardPage`, `LoginPage` | `Dashboard`, `login` |
| Layout components | `PascalCase` + `Layout` suffix | `DashboardLayout` | `DashLayout` |
| Component file | Same as component name + `.tsx` | `UserProfileCard.tsx` | `userProfileCard.tsx` |

---

## 3. Custom Hooks

| Rule | Convention | ✅ Correct | ❌ Incorrect |
|---|---|---|---|
| All hooks | `camelCase` prefixed with `use` | `useAuthSession` | `AuthSession`, `authSessionHook` |
| Hook file | Same name as hook + `.ts` | `useAuthSession.ts` | `authSession.ts` |
| Return value (object) | Descriptive named properties | `{ user, isLoading, error }` | `{ data, loading, err }` |

---

## 4. TypeScript Types & Interfaces

| Rule | Convention | ✅ Correct | ❌ Incorrect |
|---|---|---|---|
| Types & Interfaces | `PascalCase` | `UserProfile`, `AuthState` | `userProfile`, `IUserProfile` |
| Props type | Component name + `Props` | `UserCardProps` | `Props`, `IProps` |
| API response type | Entity name + `Response` | `UserResponse`, `OrderListResponse` | `APIData` |
| API request type | Entity name + `Request` | `CreateUserRequest` | `UserData` |
| Enum | `PascalCase` | `OrderStatus` | `orderStatus`, `ORDER_STATUS` |
| Enum values | `PascalCase` | `OrderStatus.Pending` | `OrderStatus.PENDING` |

---

## 5. Variables & Constants

| Rule | Convention | ✅ Correct | ❌ Incorrect |
|---|---|---|---|
| All variables | `camelCase` | `userProfile`, `totalPrice` | `UserProfile`, `total_price` |
| Boolean | Prefix: `is`, `has`, `can`, `should` | `isLoading`, `hasError` | `loading`, `error` |
| Collections / arrays | Plural noun | `users`, `orderItems` | `userList`, `arr`, `data` |
| App-wide constants | `UPPER_SNAKE_CASE` in `constants/` | `MAX_FILE_SIZE_MB` | `maxFileSizeMb`, `maxfilesize` |
| Component-level constants | `camelCase` | `const defaultPageSize = 20` | `const DEFAULT_PAGE_SIZE` |
| Ref values | `camelCase` + `Ref` suffix | `inputRef`, `containerRef` | `ref1`, `myRef` |

---

## 6. Functions

| Rule | Convention | ✅ Correct | ❌ Incorrect |
|---|---|---|---|
| All functions | `camelCase` | `calculateTotalPrice()` | `CalculateTotalPrice()` |
| Event handlers (props) | `on` + PascalCase event | `onSubmit`, `onUserSelect` | `handleSubmit`, `clickHandler` |
| Event handler implementations | `handle` + PascalCase event | `handleSubmit`, `handleUserSelect` | `submit`, `onClick` |
| Async functions | Describe what is returned | `fetchUserProfile()` | `getUserProfileAsync()` |
| Boolean-returning | Prefix: `is`, `has`, `can` | `isValidEmail()` | `validateEmail()` (as boolean) |

---

## 7. API & Query Functions

| Item | Convention | Example |
|---|---|---|
| API function file | `camelCase` + `Api.ts` | `userApi.ts` |
| API function | `camelCase` verb + noun | `fetchUserById`, `createOrder` |
| Query hook | `use` + noun + `Query` | `useUserQuery`, `useOrderListQuery` |
| Mutation hook | `use` + verb + noun + `Mutation` | `useCreateOrderMutation` |
| Query key | Const array with feature name | `['user', userId]`, `['orders']` |

---

## 8. State Management (Zustand)

| Item | Convention | Example |
|---|---|---|
| Store file | `camelCase` + `Store.ts` | `cartStore.ts` |
| Store hook | `use` + PascalCase + `Store` | `useCartStore` |
| State properties | `camelCase` | `items`, `totalPrice`, `isOpen` |
| Actions | Imperative verb + noun | `addItem`, `removeItem`, `clearCart` |

---

## 9. CSS & Styling

| Item | Convention | Example |
|---|---|---|
| CSS Module class | `camelCase` | `.cardContainer`, `.primaryButton` |
| CSS Custom Property | `--kebab-case` prefixed `--app-` | `--app-color-primary`, `--app-spacing-md` |
| Animation keyframe | `camelCase` | `@keyframes fadeIn`, `@keyframes slideUp` |

---

## 10. Files & Folders

| Item | Convention | Example |
|---|---|---|
| Component file | `PascalCase.tsx` | `UserProfileCard.tsx` |
| Hook file | `camelCase.ts` | `useAuthSession.ts` |
| Utility file | `camelCase.ts` | `formatDate.ts` |
| Types file | `camelCase.types.ts` | `auth.types.ts` |
| Store file | `camelCase.store.ts` | `cart.store.ts` |
| API file | `camelCase.api.ts` | `user.api.ts` |
| Test file | Source file + `.test.tsx/.ts` | `UserProfileCard.test.tsx` |
| Feature folder | `camelCase` | `auth/`, `userProfile/` |
| Shared component folder | `PascalCase` (matches component) | `Button/`, `Modal/` |

---

## 11. Common Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Correct |
|---|---|
| `const data = await fetchUser()` | `const user = await fetchUserById(id)` |
| `props.handleClick` | `props.onClick` (prop) / `handleClick` (impl) |
| `IUserInterface` | `User`, `UserProfile` |
| `UserComponent` | `UserCard`, `UserProfileCard` |
| `useData()` | `useUserProfile()` |
| `const arr = []` | `const users: User[] = []` |
| `any` type | Explicit type or `unknown` |
