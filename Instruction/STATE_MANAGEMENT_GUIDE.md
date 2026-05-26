# STATE MANAGEMENT GUIDE — Web (React / TypeScript)

> Defines when and how to manage state in this React project.
> AI assistants must follow these patterns for all state-related code.

---

## 1. State Classification

| State Type | Tool | Scope |
|---|---|---|
| Server / async data | TanStack Query | Global cache |
| Global UI state | Zustand | App-wide |
| Local component state | `useState` / `useReducer` | Single component |
| Form state | React Hook Form | Form scope |
| URL / navigation state | React Router search params | Browser URL |
| Derived state | `useMemo` | Computed, no storage |

> **Rule**: Use the most local state tool that satisfies the need.
> Global state is only justified when state is **shared across unrelated components**.

---

## 2. Server State — TanStack Query

### ✅ All server/async data managed by TanStack Query
```typescript
// ✅ Correct
const { data: user, isLoading, error } = useQuery({
    queryKey: userKeys.byId(userId),
    queryFn: () => userApi.fetchById(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
});

// ❌ Incorrect — manual useEffect for fetching
const [user, setUser] = useState<User | null>(null);
useEffect(() => {
    userApi.fetchById(userId).then(setUser);
}, [userId]);
```

### ✅ Mutations invalidate related queries
```typescript
// ✅ Correct
const mutation = useMutation({
    mutationFn: userApi.update,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.byId(userId) });
    },
});
```

### ✅ Define query keys as typed constants
```typescript
// ✅ Correct — src/features/user/api/userKeys.ts
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    byId: (id: string) => [...userKeys.all, id] as const,
};
```

---

## 3. Global Client State — Zustand

### ✅ Use Zustand only for shared UI state — not server data
```typescript
// ✅ Correct — cart UI state is truly global
interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    openCart: () => void;
    closeCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
    items: [],
    isOpen: false,
    addItem: (item) => set((state) => ({
        items: state.items.find(i => i.id === item.id)
            ? state.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
            : [...state.items, item],
    })),
    removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id),
    })),
    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
}));

// ❌ Incorrect — server data in Zustand
const useUserStore = create((set) => ({
    user: null,
    fetchUser: async (id) => {
        const user = await userApi.fetchById(id);
        set({ user }); // Use TanStack Query instead
    },
}));
```

---

## 4. Local Component State — `useState` / `useReducer`

### ✅ Use `useState` for simple local state
```typescript
// ✅ Correct — local UI toggle
const [isOpen, setIsOpen] = useState(false);
const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
```

### ✅ Use `useReducer` for complex local state with multiple sub-values
```typescript
// ✅ Correct — complex form step state
type StepState = { step: number; data: Partial<FormData>; errors: Record<string, string> };
type StepAction =
    | { type: 'NEXT'; data: Partial<FormData> }
    | { type: 'BACK' }
    | { type: 'SET_ERROR'; field: string; message: string };

const [state, dispatch] = useReducer(stepReducer, initialState);
```

---

## 5. Form State — React Hook Form

```typescript
// ✅ Correct — never manage form state manually
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
});

const onSubmit = handleSubmit(async (data) => {
    await loginMutation.mutateAsync(data);
});

// ❌ Incorrect — manual form state
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});
```

---

## 6. URL State

### ✅ Use URL search params for shareable/filterable state
```typescript
// ✅ Correct — filter state lives in URL (bookmarkable, shareable)
const [searchParams, setSearchParams] = useSearchParams();

const category = searchParams.get('category') ?? 'all';
const page = Number(searchParams.get('page') ?? '1');

const applyFilter = (newCategory: string) => {
    setSearchParams({ category: newCategory, page: '1' });
};
```

---

## 7. Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Correct |
|---|---|
| `useEffect` for fetching | TanStack Query `useQuery` |
| Server data in Zustand | TanStack Query |
| Global state for local toggle | `useState` in component |
| Redux for new projects | Zustand + TanStack Query |
| `useState` for form fields | React Hook Form |
| Prop drilling > 2 levels | Zustand or Context |
| `useContext` causing too many re-renders | Zustand slice |
