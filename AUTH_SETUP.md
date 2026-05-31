# Axios Bearer Auth Setup - Quick Reference

## Files Created

### Auth Infrastructure
```
lib/auth/
├── token-manager.ts        # localStorage token operations
├── axios-instance.ts       # axios with interceptors
└── auth-client.ts          # auth API calls

lib/hooks/
└── use-auth.ts             # React Query auth hook

proxy.ts                     # Next.js route protection
```

### Auth Endpoints
```
app/api/auth/
├── login/route.ts          # POST /api/auth/login
├── refresh/route.ts        # POST /api/auth/refresh
└── logout/route.ts         # POST /api/auth/logout

app/login/
└── page.tsx                # Login UI page
```

### Updated Data Hooks
All updated to use axios instead of fetch:
```
lib/hooks/
├── use-products.ts
├── use-banners.ts
├── use-collections.ts
├── use-blogs.ts
├── use-orders.ts
├── use-comments.ts
└── use-sms.ts
```

## Quick Start

### 1. User Logs In
```
Navigate to /login
Enter: admin@petfood.com / admin123
Tokens stored in localStorage
```

### 2. Making Protected Requests
```typescript
import { useProducts } from '@/lib/hooks/use-products'

function Dashboard() {
  const { data } = useProducts()
  // Authorization: Bearer {token} added automatically
  return <div>{data.map(p => p.name)}</div>
}
```

### 3. Logout
```typescript
import { useAuth } from '@/lib/hooks/use-auth'

function Header() {
  const { logout } = useAuth()
  return <button onClick={() => logout()}>Logout</button>
}
```

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER LOGIN                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │  POST /api/auth/    │
            │       login         │
            └──────────┬──────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
    Success                        Failure
    │                              │
    ▼                              ▼
Store tokens              Show error message
  in localStorage              on login page
    │                              │
    ▼                              │
Redirect to /                      │
    │                              │
    └──────────┬───────────────────┘
               │
        ┌──────▼──────────────────────────┐
        │  ACCESSING PROTECTED ROUTES     │
        │    (dashboard, api, etc)        │
        └──────┬───────────────────────────┘
               │
        ┌──────▼────────────────┐
        │ Request Interceptor   │
        │  Add Bearer Token     │
        └──────┬────────────────┘
               │
               ▼
        ┌────────────────┐
        │ Backend        │
        │ validates      │
        └────┬───────────┘
            │
     ┌──────┴──────┐
     │             │
  Valid       401 Unauthorized
     │             │
     ▼             ▼
  Success    Response Interceptor
     │        Trigger Refresh
     │             │
     │        ┌────▼──────────────────┐
     │        │ POST /api/auth/       │
     │        │      refresh          │
     │        └────┬──────────────────┘
     │             │
     │        ┌────▼──────────────┐
     │        │ New access token  │
     │        │ Update localStorage
     │        └────┬──────────────┘
     │             │
     │        Retry original request
     │             │
     └─────────────┘
```

## Token Storage

### localStorage (Current)
```javascript
// Tokens stored in browser localStorage
localStorage.getItem('accessToken')    // access_xxxx
localStorage.getItem('refreshToken')   // refresh_xxxx

// Automatically managed by:
tokenManager.setTokens(access, refresh)
tokenManager.clearTokens()
```

### Cookies (Recommended for Production)
```javascript
// Tokens set in HTTP-only cookies via /api/auth/login
// Not accessible from JavaScript (more secure)
// Automatically sent with requests

// Current auth endpoints already set cookies:
response.cookies.set('accessToken', ...)
response.cookies.set('refreshToken', ...)
```

## Route Protection

### Protected Routes
Require valid accessToken:
- `/` (dashboard root)
- `/(dashboard)/*` (all dashboard pages)
- `/api/*` (all API endpoints)

### Public Routes
No authentication required:
- `/login`
- `/register`

### Redirect Behavior
```
/login?redirect=/products
       ↑
     Preserved after login
     Redirect to /products after auth success
```

## API Endpoints

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@petfood.com",
  "password": "admin123"
}

Response:
{
  "accessToken": "access_...",
  "refreshToken": "refresh_...",
  "user": { "id": "1", "email": "...", "name": "..." }
}
```

### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_..."
}

Response:
{
  "accessToken": "access_new_...",
  "refreshToken": "refresh_new_..."
}
```

### Logout
```bash
POST /api/auth/logout

Response:
{ "message": "Logged out successfully" }
```

## Axios Instance Usage

### Direct Usage
```typescript
import axiosInstance from '@/lib/auth/axios-instance'

// All requests automatically include Authorization header
const { data } = await axiosInstance.get('/api/products')
const { data } = await axiosInstance.post('/api/products', productData)
```

### Via React Query Hooks (Recommended)
```typescript
import { useProducts } from '@/lib/hooks/use-products'

function MyComponent() {
  const { data, isLoading } = useProducts()
  // No need to think about auth - it's handled
}
```

## Debugging

### Check Tokens
```javascript
// In browser console
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
tokenManager.hasAccessToken()
```

### Monitor Requests
1. Open DevTools → Network tab
2. Look for Authorization header in requests:
   ```
   Authorization: Bearer access_xxxxx
   ```
3. Check response headers for Set-Cookie (token refresh)

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 on every request | Token expired or invalid | Login again, check refresh endpoint |
| Redirect to /login | No accessToken in localStorage | Clear localStorage, login again |
| CORS error on /api/auth/login | Browser security | Check CORS headers in auth endpoint |
| Token not sent in header | Using wrong axios import | Use `axiosInstance` not default `axios` |
| Infinite refresh loop | Refresh endpoint also returns 401 | Check refresh token validation logic |

## Integration Checklist

- [x] Axios installed
- [x] Token manager created
- [x] Axios interceptors configured
- [x] Auth client created
- [x] useAuth hook created
- [x] Proxy.ts route protection added
- [x] Auth endpoints created (/login, /refresh, /logout)
- [x] Login page created
- [x] All data hooks updated to use axios
- [x] Build successful
- [ ] Database integration (when ready)
- [ ] JWT implementation (when ready)
- [ ] Production deployment (when ready)

## Next Steps

1. **Test Login**: Navigate to /login with demo credentials
2. **Verify Token Injection**: Open DevTools Network tab, check Authorization header
3. **Test Protected Routes**: Try accessing /products, /orders, etc.
4. **Test Logout**: Click logout, verify redirect to /login
5. **Integrate Database**: Replace mock login with real user validation
6. **Implement JWT**: Replace mock tokens with proper JWTs
7. **Deploy**: Push to production

## Support

For detailed information, see:
- `AUTH_IMPLEMENTATION.md` - Complete architecture
- `lib/auth/token-manager.ts` - Token storage
- `lib/auth/axios-instance.ts` - Interceptor logic
- `proxy.ts` - Route protection
- `app/api/auth/` - Backend endpoints
