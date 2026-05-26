# ERROR HANDLING GUIDE — Web (React / TypeScript)

> Defines how errors are represented, propagated, and displayed in this React project.
> AI assistants must follow these patterns for all error-handling code.

---

## 1. Error Architecture

```
API Layer (axios)     → normalize to ApiError shape
TanStack Query        → surfaces error to hook consumers
Component Layer       → renders error state
Global Error Boundary → catches unhandled render errors
Sentry                → logs all errors in production
```

---

## 2. API Error Shape

### ✅ Normalize all API errors at the axios interceptor
```typescript
// ✅ src/lib/apiClient.ts
export interface ApiError {
    message: string;
    code: string;
    status: number;
    details?: Record<string, string[]>; // validation errors
}

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const apiError: ApiError = {
            message: error.response?.data?.message ?? 'An unexpected error occurred.',
            code: error.response?.data?.code ?? 'UNKNOWN_ERROR',
            status: error.response?.status ?? 0,
            details: error.response?.data?.errors,
        };
        return Promise.reject(apiError);
    }
);
```

---

## 3. TanStack Query Error Handling

### ✅ Access typed error in query hooks
```typescript
// ✅ Correct
const { data, isLoading, error } = useQuery<User, ApiError>({
    queryKey: userKeys.byId(userId),
    queryFn: () => userApi.fetchById(userId),
    retry: (failureCount, error) => error.status >= 500 && failureCount < 2,
});

if (error?.status === 404) return <NotFoundPage />;
if (error) return <ErrorMessage message={error.message} />;
```

### ✅ Handle mutation errors in `onError` callback
```typescript
// ✅ Correct
const mutation = useMutation<User, ApiError, CreateUserRequest>({
    mutationFn: userApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
    onError: (error) => {
        if (error.status === 422) {
            setFormErrors(error.details ?? {});
        } else {
            toast.error(error.message);
        }
    },
});
```

---

## 4. Error Boundary — Render Error Catching

### ✅ Implement Error Boundaries at route level
```tsx
// ✅ src/shared/components/ErrorBoundary/ErrorBoundary.tsx
class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }> {
    state = { hasError: false, error: null as Error | null };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    }

    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}

// ✅ Wrap each route
<ErrorBoundary fallback={<ErrorPage />}>
    <DashboardPage />
</ErrorBoundary>
```

---

## 5. Toast Notification System

### ✅ All user-facing transient errors shown via toast
```typescript
// ✅ Correct — centralized toast utility
import toast from 'react-hot-toast';

// Usage in mutation handlers
onError: (error: ApiError) => {
    toast.error(error.message, { duration: 5000 });
}

// For network errors
onError: (error: ApiError) => {
    if (error.status === 0) {
        toast.error('No internet connection. Please check your network.');
    } else {
        toast.error(error.message);
    }
}
```

---

## 6. Validation Error Display

### ✅ Map API validation errors to form fields
```tsx
// ✅ Correct
const { setError } = useForm<CreateUserForm>();

onError: (error: ApiError) => {
    if (error.status === 422 && error.details) {
        Object.entries(error.details).forEach(([field, messages]) => {
            setError(field as keyof CreateUserForm, { message: messages[0] });
        });
    }
}
```

---

## 7. Global Unhandled Error Logging

```typescript
// ✅ src/lib/sentry.ts — log all unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason);
});
```

---

## 8. Rules

- ✅ All API errors normalized to `ApiError` at the interceptor level
- ✅ Loading, error, and empty states handled for every async operation
- ✅ Error Boundaries wrap every route
- ✅ Validation errors mapped to form fields (422)
- ✅ Network/server errors shown via toast
- ✅ All errors logged to Sentry in production
- ❌ Never show raw error objects to users
- ❌ Never silently catch errors with empty `catch` blocks
- ❌ Never use `console.error` as the only error handling strategy
