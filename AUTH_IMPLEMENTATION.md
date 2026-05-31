# Axios Bearer Token Authentication with Next.js Proxy

Complete implementation of bearer token authentication with axios interceptors and Next.js route protection.

## Architecture Overview

### 1. **Token Manager** (`lib/auth/token-manager.ts`)
Handles localStorage operations for accessToken and refreshToken:
- `getAccessToken()` - Retrieve access token
- `getRefreshToken()` - Retrieve refresh token
- `setTokens(accessToken, refreshToken)` - Store both tokens
- `clearTokens()` - Clear tokens on logout or failed refresh
- `hasAccessToken()` - Check if authenticated

### 2. **Axios Instance** (`lib/auth/axios-instance.ts`)
Configured axios client with automatic bearer token injection and refresh logic:

**Request Interceptor:**
- Automatically adds `Authorization: Bearer {accessToken}` header to all requests
- Only adds token if it exists in localStorage

**Response Interceptor:**
- **401 Unauthorized**: Triggers token refresh flow
  - Validates refresh token exists
  - Calls `/api/auth/refresh` with refresh token
  - Updates both tokens in localStorage
  - Retries original request with new access token
  - Queues failed requests during refresh to avoid race conditions
- **403 Forbidden**: Clears tokens and redirects to login
- Automatic redirect to `/login` on auth failure

### 3. **Auth Client** (`lib/auth/auth-client.ts`)
Separate axios instance (avoids circular dependency) for auth endpoints:
- `login(email, password)` - Returns accessToken, refreshToken, and user
- `refreshToken(refreshToken)` - Returns new accessToken and refreshToken
- `logout()` - Clears backend session

### 4. **useAuth Hook** (`lib/hooks/use-auth.ts`)
React Query hook for auth operations:
```typescript
const { 
  isAuthenticated,  // () => boolean
  login,            // (email, password) => void
  loginPending,     // boolean
  loginError,       // error | null
  logout,           // () => void
  logoutPending,    // boolean
  accessToken       // string | null
} = useAuth()
```

### 5. **Proxy Middleware** (`proxy.ts`)
Next.js route protection - runs on every request:
- **Protected routes**: `/(dashboard)/*`, `/api/*`
- **Public routes**: `/login`, `/register`, `/`
- Checks for `accessToken` in cookies or Authorization header
- Redirects unauthenticated users to `/login?redirect={pathname}`

### 6. **Auth API Endpoints**

#### `POST /api/auth/login`
**Request:**
```json
{
  "email": "admin@petfood.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "accessToken": "access_1234567890_xyz...",
  "refreshToken": "refresh_1234567890_abc...",
  "user": {
    "id": "1",
    "email": "admin@petfood.com",
    "name": "Admin User"
  }
}
```

Sets httpOnly cookies:
- `accessToken` - 15 minutes
- `refreshToken` - 7 days

#### `POST /api/auth/refresh`
**Request:**
```json
{
  "refreshToken": "refresh_1234567890_abc..."
}
```

**Response:**
```json
{
  "accessToken": "access_new_token...",
  "refreshToken": "refresh_new_token..."
}
```

#### `POST /api/auth/logout`
Clears cookies and backend session.

## Token Flow

### Login Flow
```
1. User submits credentials
2. POST /api/auth/login
3. Backend validates and returns accessToken + refreshToken
4. Client stores both in localStorage
5. Redirect to dashboard
```

### Request with Token
```
1. Frontend makes API request (e.g., GET /api/products)
2. Request interceptor adds Authorization header
3. Request sent with: Authorization: Bearer {accessToken}
4. Backend validates token
5. Response returned
```

### Token Refresh Flow
```
1. Request returns 401 Unauthorized
2. Response interceptor checks if refresh possible
3. POST /api/auth/refresh with refreshToken
4. Server validates and returns new accessToken + refreshToken
5. Client updates localStorage
6. Original request automatically retried with new token
7. Response returned to user
```

### Logout Flow
```
1. User clicks logout
2. useAuth().logout() called
3. POST /api/auth/logout (optional)
4. Client clears tokens from localStorage
5. Redirect to /login
6. Protected routes now inaccessible
```

## React Query Hooks Integration

All data-fetching hooks use axios instance automatically:

```typescript
// All hooks automatically use axios with bearer token
import { useProducts } from '@/lib/hooks/use-products'

function MyComponent() {
  const { data, isLoading, error } = useProducts()
  
  // Authorization header automatically added
  // Token refresh handled automatically
}
```

Updated hooks:
- `use-products.ts` - Products CRUD
- `use-banners.ts` - Banners management
- `use-collections.ts` - Collections
- `use-blogs.ts` - Blog posts
- `use-orders.ts` - Orders with status updates
- `use-comments.ts` - Comments moderation
- `use-sms.ts` - SMS templates

## Security Features

✅ **Bearer Token Strategy**
- Standard Authorization header: `Bearer {token}`
- Tokens stored in localStorage (consider httpOnly cookies for production)

✅ **Automatic Token Refresh**
- Seamless user experience
- Prevents 401 errors from reaching UI
- Queues requests during refresh

✅ **Route Protection**
- Proxy middleware checks every request
- Unauthenticated users redirected to login
- Redirect parameter preserved for post-login navigation

✅ **Token Expiration**
- Access token: 15 minutes (short-lived)
- Refresh token: 7 days (long-lived)
- Automatic refresh before expiration

✅ **Error Handling**
- 401: Trigger refresh flow
- 403: Clear tokens, redirect to login
- Network errors: Pass to error boundary

## Testing

### Login (Demo Credentials)
```
Email: admin@petfood.com
Password: admin123

OR

Email: manager@petfood.com
Password: manager123
```

### Manual Testing
1. Navigate to `/login`
2. Enter credentials
3. Tokens stored in localStorage
4. Access `/` dashboard
5. Verify `Authorization` header in Network tab
6. Check token refresh after 15 minutes (in production)

## Environment Variables

Optional - defaults to `http://localhost:3000`:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

## Migration Guide

If replacing existing fetch-based hooks:

```typescript
// Before (fetch)
const response = await fetch('/api/products', {
  headers: { 'Content-Type': 'application/json' }
})

// After (axios)
import axiosInstance from '@/lib/auth/axios-instance'
const { data } = await axiosInstance.get('/api/products')
// Authorization header added automatically
```

## Production Checklist

- [ ] Replace mock login endpoint with real database
- [ ] Use proper JWT token validation
- [ ] Enable httpOnly cookies in auth endpoints
- [ ] Set `secure: true` for HTTPS only
- [ ] Implement token revocation on logout
- [ ] Add rate limiting to auth endpoints
- [ ] Monitor token refresh patterns
- [ ] Set up proper CORS policies
- [ ] Consider adding CSRF protection
- [ ] Implement token rotation strategy

## Common Issues

### Issue: 401 on every request
**Solution**: Check if token exists in localStorage. Verify auth endpoints are working correctly.

### Issue: Infinite loop of 401s
**Solution**: Ensure refresh endpoint doesn't also return 401. Check refresh token validity.

### Issue: Token not being sent
**Solution**: Verify axios instance is imported (not default axios). Check that `hasAccessToken()` returns true.

### Issue: CORS errors on auth requests
**Solution**: Configure CORS headers in auth endpoints. Use credentials in axios config if needed.
