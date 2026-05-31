# Type System Documentation

This document describes the complete type system used in the PetFood Shop Dashboard, aligned with your backend API structure.

## Directory Structure

All types are organized in `/lib/types/` with an index file for convenient re-exports:

```
lib/types/
├── index.ts          # Central export point
├── user.ts           # User and role types
├── product.ts        # Product, variant, attribute, image, discount types
├── category.ts       # Category types
├── banner.ts         # Banner types
├── collection.ts     # Collection types
├── blog.ts           # Blog types
├── cart.ts           # Cart and cart item types
├── wishlist.ts       # Wishlist types
└── referral.ts       # Referral types
```

## Type Definitions

### User Types (`lib/types/user.ts`)

```typescript
export type Role = "USER" | "ADMIN" | string;

export type User = {
  id: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string; // Format: "YYYY-MM-DD"
  role: Role;
  isActive: boolean;
  referralCode?: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Product Types (`lib/types/product.ts`)

```typescript
export type DiscountType = "percentage" | "fixed";

export type Discount = {
  id: string;
  productId: string;
  type: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductAttribute = {
  id: string;
  productId: string;
  key: string;
  value: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  variantId?: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  order: number;
  altText?: string;
  isPrimary: boolean;
};

export type ProductVariant = {
  id: string;
  productId: string;
  color?: string;
  size?: string;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  isActive: boolean;

  categoryId?: string;
  category?: Category | null;

  variants?: ProductVariant[];
  images?: ProductImage[];
  attributes?: ProductAttribute[];
  discounts?: Discount[];

  createdAt: string;
  updatedAt: string;
};
```

### Category Types (`lib/types/category.ts`)

```typescript
export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  order: number;
  isActive: boolean;

  parentId?: string;
  parent?: Category | null;
  children?: Category[];

  createdAt: string;
  updatedAt: string;
};
```

### Banner Types (`lib/types/banner.ts`)

```typescript
export type BannerPosition = string; // e.g., "home" | "category"

export type Banner = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  position: BannerPosition;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Collection Types (`lib/types/collection.ts`)

```typescript
export type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;

  products?: Product[];

  createdAt: string;
  updatedAt: string;
};
```

### Blog Types (`lib/types/blog.ts`)

```typescript
export type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;

  authorId?: string;
  author?: User;

  featuredImage?: string;
  publishedAt?: string;
  isPublished: boolean;

  createdAt: string;
  updatedAt: string;
};
```

### Cart Types (`lib/types/cart.ts`)

```typescript
export type CartItem = {
  id: string;
  cartId: string;
  variantId: string;

  variant?: ProductVariant;

  quantity: number;
  addedAt: string;
};

export type Cart = {
  id: string;
  userId: string;
  user?: User;

  items: CartItem[];

  expiresAt?: string;

  createdAt: string;
  updatedAt: string;
};
```

### Wishlist Types (`lib/types/wishlist.ts`)

```typescript
export type Wishlist = {
  id: string;

  userId: string;
  user?: User;

  productId: string;
  product?: Product;

  variantId?: string;
  variant?: ProductVariant | null;

  addedAt: string;
};
```

### Referral Types (`lib/types/referral.ts`)

```typescript
export type ReferralStatus = "pending" | "completed";

export type Referral = {
  id: string;

  referrerId: string;
  referrer?: User;

  referredId?: string;
  referred?: User | null;

  code: string;
  status: ReferralStatus;

  referrerReward: number;
  referredReward: number;

  completedAt?: string;
  createdAt: string;
};
```

## Using Types in Components

### Import from Index

```typescript
import type {
  Product,
  User,
  Banner,
  Collection,
} from '@/lib/types';
```

### Using in React Components

```typescript
import type { Product } from '@/lib/types';
import { useProducts } from '@/lib/hooks/use-products';

export function ProductList() {
  const { data: products, isLoading } = useProducts();

  return (
    <div>
      {products?.map((product: Product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## Using Types in API Routes

```typescript
import type { Product } from '@/lib/types';
import { mockProducts } from '@/lib/data';

export async function GET() {
  const products: Product[] = mockProducts;
  return Response.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return Response.json(newProduct, { status: 201 });
}
```

## Database Integration

When connecting to your actual backend:

1. Replace mock data imports with API calls
2. Types remain the same (ensure backend returns data matching these types)
3. Update React Query hooks queryFn to call real API
4. Update API route handlers to call backend endpoints

### Example Adapter

```typescript
// Before: Using mock data
import { mockProducts } from '@/lib/data';

// After: Using backend API
async function fetchProducts(): Promise<Product[]> {
  const response = await axiosInstance.get('/api/products');
  return response.data;
}
```

## Type Safety Notes

- All types use `type` keyword (not `interface`) for consistency
- Optional fields use `?:` syntax
- Related types include proper imports to avoid circular dependencies
- Timestamps are strings (ISO 8601 format)
- IDs are always strings for universal compatibility

## Extending Types

To add new fields or variants:

1. Update the type definition in the corresponding file
2. Update mock data in `lib/data.ts` if needed
3. Update React Query hooks if the field affects queries
4. Update API endpoints to handle new fields
5. Update components that display the data

Example:

```typescript
// lib/types/product.ts
export type Product = {
  // ... existing fields
  rating?: number; // New optional field
  reviews?: Review[]; // New optional relationship
};
```

## Related Documentation

- [React Query Integration](./REACT_QUERY_INTEGRATION.md)
- [Axios Authentication](./AUTH_SETUP.md)
- [SMS Implementation](./SMS_IMPLEMENTATION.md)
