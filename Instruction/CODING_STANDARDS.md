# CODING STANDARDS — Web (React / TypeScript)

> Explicit Do ✅ / Don't ❌ rules with code examples.
> AI assistants must apply these standards to every piece of generated React/TypeScript code.

---

## 1. TypeScript Standards

### ✅ Always type all props, return types, and function parameters
```typescript
// ✅ Correct
interface UserCardProps {
    user: User;
    onSelect: (userId: string) => void;
    isHighlighted?: boolean;
}

const UserCard = ({ user, onSelect, isHighlighted = false }: UserCardProps) => { ... }

// ❌ Incorrect
const UserCard = ({ user, onSelect, isHighlighted }: any) => { ... }
```

### ✅ Use `unknown` instead of `any` for indeterminate types
```typescript
// ✅ Correct
function parseResponse(data: unknown): User {
    if (!isUser(data)) throw new Error('Invalid user data');
    return data;
}

// ❌ Incorrect
function parseResponse(data: any): User { return data; }
```

### ✅ Use Zod to validate all API response shapes at the boundary
```typescript
// ✅ Correct
const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
});
type User = z.infer<typeof UserSchema>;

async function fetchUser(id: string): Promise<User> {
    const res = await apiClient.get(`/users/${id}`);
    return UserSchema.parse(res.data);
}
```

---

## 2. React Component Standards

### ✅ One component per file — functional components only
```typescript
// ✅ Correct — focused, single responsibility
const UserProfileCard = ({ user }: UserProfileCardProps) => {
    return (
        <div className={styles.card}>
            <UserAvatar src={user.avatar} />
            <UserInfo name={user.name} email={user.email} />
        </div>
    );
};

export default UserProfileCard;
```

### ✅ Extract logic into custom hooks — never in JSX
```typescript
// ✅ Correct
const { user, isLoading, error } = useUserProfile(userId);

// ❌ Incorrect — logic inside component
const [user, setUser] = useState(null);
useEffect(() => {
    fetch(`/api/users/${userId}`).then(r => r.json()).then(setUser);
}, [userId]);
```

### ✅ Use named exports for components; default only for pages
```typescript
// ✅ Correct — named export for reusable component
export const UserCard = ({ user }: UserCardProps) => { ... };

// ✅ Correct — default export for page/route
export default function DashboardPage() { ... }
```

---

## 3. Data Fetching Standards

### ✅ Always use TanStack Query — never raw useEffect for fetching
```typescript
// ✅ Correct
const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.fetchById(userId),
    staleTime: 5 * 60 * 1000,
});

// ❌ Incorrect
useEffect(() => {
    fetch(`/api/users/${userId}`)
        .then(r => r.json())
        .then(setUser);
}, [userId]);
```

### ✅ Define query keys as constants
```typescript
// ✅ Correct
export const userKeys = {
    all: ['users'] as const,
    byId: (id: string) => ['users', id] as const,
};

const { data } = useQuery({
    queryKey: userKeys.byId(userId),
    queryFn: () => userApi.fetchById(userId),
});
```

---

## 4. State Management Standards

### ✅ Use Zustand only for true global UI state
```typescript
// ✅ Correct — global cart state
interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
}

const useCartStore = create<CartStore>((set) => ({
    items: [],
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
}));

// ❌ Incorrect — server data in Zustand
const useUserStore = create(() => ({
    user: null,
    fetchUser: async (id) => { /* API call here */ }
}));
```

---

## 5. Error Handling Standards

### ✅ Always handle loading, error, and empty states
```tsx
// ✅ Correct
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage message={error.message} />;
if (!users.length) return <EmptyState message="No users found." />;

return <UserList users={users} />;

// ❌ Incorrect
return <UserList users={users ?? []} />;
```

### ✅ Use Error Boundaries at route level
```tsx
// ✅ Correct — in router config
{
    path: '/dashboard',
    element: (
        <ErrorBoundary fallback={<ErrorPage />}>
            <DashboardPage />
        </ErrorBoundary>
    )
}
```

---

## 6. CSS / Styling Standards

### ✅ Use CSS variables for all design tokens — never hardcode values
```css
/* ✅ Correct */
.button {
    background-color: var(--app-color-primary);
    padding: var(--app-spacing-md);
    border-radius: var(--app-radius-sm);
}

/* ❌ Incorrect */
.button {
    background-color: #6366f1;
    padding: 12px 24px;
    border-radius: 8px;
}
```

---

## 7. Performance Standards

### ✅ Lazy load all route components
```typescript
// ✅ Correct
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));

// ❌ Incorrect
import DashboardPage from '@/features/dashboard/DashboardPage';
```

### ❌ Never use array index as React list key
```tsx
// ❌ Incorrect
users.map((user, index) => <UserCard key={index} user={user} />)

// ✅ Correct
users.map((user) => <UserCard key={user.id} user={user} />)
```

---

## 8. Security Standards

### ❌ Never store tokens in localStorage
```typescript
// ❌ Incorrect
localStorage.setItem('accessToken', token);

// ✅ Correct — use httpOnly cookies (server-set) or memory
// Tokens are stored in httpOnly cookies set by the server
```

### ❌ Never use dangerouslySetInnerHTML with user content
```tsx
// ❌ Extremely dangerous
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Correct — sanitize first if HTML is truly required
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```
