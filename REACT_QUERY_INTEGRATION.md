# React Query Integration Documentation

## Overview

All dashboard pages (Products, Banners, Collections, Blogs, Orders, Comments, and SMS Management) have been integrated with **React Query** (@tanstack/react-query) for efficient data fetching, caching, and state management.

## Architecture

### React Query Setup

**File:** `app/providers.tsx`
- Initializes `QueryClient` with default 5-minute stale time
- Wraps entire app with `QueryClientProvider`
- Provides automatic request deduplication and cache management

**File:** `app/layout.tsx`
- Wraps children with `<Providers>` component
- Enables React Query functionality across all pages

### Custom Hooks Structure

All custom hooks follow a consistent pattern for CRUD operations:

```typescript
// useProducts.ts example
export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: fetchProducts })
}

export function useCreateProduct() {
  return useMutation({ mutationFn: createProduct, onSuccess: invalidateCache })
}

export function useUpdateProduct(id: string) {
  return useMutation({ mutationFn: updateProduct, onSuccess: invalidateCache })
}

export function useDeleteProduct(id: string) {
  return useMutation({ mutationFn: deleteProduct, onSuccess: invalidateCache })
}
```

## Available Hooks

### Products (`lib/hooks/use-products.ts`)
- `useProducts()` - Fetch all products
- `useProduct(id)` - Fetch single product
- `useCreateProduct()` - Create new product
- `useUpdateProduct(id)` - Update product
- `useDeleteProduct(id)` - Delete product

### Banners (`lib/hooks/use-banners.ts`)
- `useBanners()` - Fetch all banners
- `useBanner(id)` - Fetch single banner
- `useCreateBanner()` - Create new banner
- `useUpdateBanner(id)` - Update banner
- `useDeleteBanner(id)` - Delete banner

### Collections (`lib/hooks/use-collections.ts`)
- `useCollections()` - Fetch all collections
- `useCollection(id)` - Fetch single collection
- `useCreateCollection()` - Create new collection
- `useUpdateCollection(id)` - Update collection
- `useDeleteCollection(id)` - Delete collection

### Blogs (`lib/hooks/use-blogs.ts`)
- `useBlogs()` - Fetch all blog posts
- `useBlog(id)` - Fetch single blog
- `useCreateBlog()` - Create new blog post
- `useUpdateBlog(id)` - Update blog post
- `useDeleteBlog(id)` - Delete blog post

### Orders (`lib/hooks/use-orders.ts`)
- `useOrders()` - Fetch all orders
- `useOrder(id)` - Fetch single order
- `useUpdateOrder(id)` - Update order status
- `useDeleteOrder(id)` - Delete order

### Comments (`lib/hooks/use-comments.ts`)
- `useComments()` - Fetch all comments
- `useComment(id)` - Fetch single comment
- `useUpdateComment(id)` - Update comment status
- `useDeleteComment(id)` - Delete comment

### SMS Templates (`lib/hooks/use-sms.ts`)
- `useSMSTemplates()` - Fetch all templates
- `useSMSTemplate(id)` - Fetch single template
- `useCreateSMSTemplate()` - Create new template
- `useUpdateSMSTemplate(id)` - Update template
- `useDeleteSMSTemplate(id)` - Delete template
- `useSendTestSMS()` - Send test SMS
- `useSMSStats()` - Fetch SMS statistics

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Banners
- `GET /api/banners` - List all banners
- `POST /api/banners` - Create banner
- `GET /api/banners/[id]` - Get single banner
- `PUT /api/banners/[id]` - Update banner
- `DELETE /api/banners/[id]` - Delete banner

### Collections
- `GET /api/collections` - List all collections
- `POST /api/collections` - Create collection
- `GET /api/collections/[id]` - Get single collection
- `PUT /api/collections/[id]` - Update collection
- `DELETE /api/collections/[id]` - Delete collection

### Blogs
- `GET /api/blogs` - List all blog posts
- `POST /api/blogs` - Create blog post
- `GET /api/blogs/[id]` - Get single blog
- `PUT /api/blogs/[id]` - Update blog
- `DELETE /api/blogs/[id]` - Delete blog

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order status
- `DELETE /api/orders/[id]` - Delete order

### Comments
- `GET /api/comments` - List all comments
- `GET /api/comments/[id]` - Get single comment
- `PUT /api/comments/[id]` - Update comment status
- `DELETE /api/comments/[id]` - Delete comment

### SMS
- `GET /api/sms/templates` - List all templates
- `POST /api/sms/templates` - Create template
- `GET /api/sms/templates/[id]` - Get single template
- `PUT /api/sms/templates/[id]` - Update template
- `DELETE /api/sms/templates/[id]` - Delete template
- `POST /api/sms/send-test` - Send test SMS
- `GET /api/sms/stats` - Get SMS statistics

## Page Integration

All dashboard pages now use React Query:

### Products Page (`app/(dashboard)/products/page.tsx`)
- Loads products with `useProducts()`
- Creates/updates/deletes with respective mutations
- Shows loading state with spinner
- Displays error state if fetch fails
- Handles form submission with mutation state

### Banners Page (`app/(dashboard)/banners/page.tsx`)
- Loads banners with `useBanners()`
- Manages banner CRUD operations
- Toggle active/inactive status
- Grid layout with action menu

### Collections Page (`app/(dashboard)/collections/page.tsx`)
- Loads collections with `useCollections()`
- Search and filter functionality
- Status management
- Card-based layout

### Blogs Page (`app/(dashboard)/blogs/page.tsx`)
- Loads blogs with `useBlogs()`
- Tag management for posts
- Status publishing (draft/published)
- Search, filter, and sort capabilities

### Orders Page (`app/(dashboard)/orders/page.tsx`)
- Loads orders with `useOrders()`
- Update order status with quick actions
- Detail view with customer info and items
- Comprehensive order management

### Comments Page (`app/(dashboard)/comments/page.tsx`)
- Loads comments with `useComments()`
- Moderation actions (approve/reject/pending)
- Star rating display
- Detail view for full review content

### SMS Page (`app/(dashboard)/sms/page.tsx`)
- Loads SMS templates with `useSMSTemplates()`
- Template CRUD with variable extraction
- Statistics tab with analytics
- Send test SMS functionality

## Key Features

### Automatic Cache Management
- All mutations automatically invalidate related query caches
- Background refetching keeps data fresh
- Stale-while-revalidate pattern for better UX

### Loading States
- Components show `Loader2` spinner during data fetch
- Mutation buttons display loading indicator during submission
- Smooth transitions between states

### Error Handling
- Queries and mutations have error states
- User-friendly error messages displayed
- Graceful fallbacks when data unavailable

### Real-time Updates
- Create/Update/Delete mutations immediately refresh related data
- No manual page refresh needed
- Optimistic updates for better UX (easily added)

## Usage Example

```tsx
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/use-products'

export default function ProductsPage() {
  // Fetch data
  const { data: products = [], isLoading, error } = useProducts()
  
  // Mutations
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct(productId)
  const deleteMutation = useDeleteProduct(productId)
  
  // Create
  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data)
  }
  
  // Update
  const handleUpdate = async (id, data) => {
    await updateMutation.mutateAsync(data)
  }
  
  // Delete
  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id)
  }
  
  return (
    // Loading state
    {isLoading && <Loader2 />}
    
    // Error state
    {error && <ErrorMessage />}
    
    // Data display
    {products.map(product => (...))}
    
    // Mutation loading
    {createMutation.isPending && <Loader2 />}
  )
}
```

## Database Integration

Currently, all endpoints use in-memory data from `lib/data.ts` for demonstration. To connect to a real database:

1. Update endpoint handlers in `/api/` routes
2. Replace mock data operations with database queries
3. Maintain the same response format for compatibility
4. No changes needed in hooks or pages - they'll work seamlessly!

Example migration to Supabase:
```typescript
// Before (mock)
export async function GET() {
  return Response.json(products)
}

// After (Supabase)
export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
  return Response.json(data)
}
```

## Performance Considerations

- **Query Stale Time:** 5 minutes (configurable in `providers.tsx`)
- **Cache Invalidation:** Automatic on mutations
- **Request Deduplication:** Enabled by default
- **Background Refetching:** Enabled for fresh data
- **Optimistic Updates:** Can be added to mutations for instant feedback

## Future Enhancements

1. **Optimistic Updates:** Update UI before server response
2. **Pagination:** Add `useInfiniteQuery` for large datasets
3. **Filtering/Sorting:** Server-side pagination and filtering
4. **Real-time Updates:** WebSocket integration for live data
5. **Error Retry:** Automatic retry logic for failed requests
6. **Offline Support:** Persist cache to localStorage

## Troubleshooting

### Data not updating
- Check that mutations are properly invalidating cache
- Verify query keys match between hooks and invalidation

### Slow initial load
- Check network tab in DevTools for slow API calls
- Consider paginating large datasets
- Verify database query performance

### Stale data
- Check staleTime configuration
- Manually trigger refetch with `refetch()` from useQuery
- Use `invalidateQueries()` for immediate refresh

## Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [TanStack Query Pattern](https://tanstack.com/query/latest/docs/react/guides/caching)
- [Best Practices](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
