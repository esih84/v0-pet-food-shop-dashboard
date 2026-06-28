// Re-export types from types directory
export type {
  User,
  Role,
  Product,
  ProductAttribute,
  ProductImage,
  Discount,
  DiscountType,
  Category,
  Banner,
  BannerPosition,
  Collection,
  Blog,
  Cart,
  CartItem,
  Wishlist,
  Referral,
  ReferralStatus,
} from "./types";

// Mock Data for Orders and Comments (not in backend types yet)
export interface OrderItem {
  productName: string;
  variant: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "refunded";
  createdAt: string;
  shippingAddress: string;
}

export interface Comment {
  id: string;
  productId: string;
  productName: string;
  customer: string;
  rating: number;
  content: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
}

// Mock Products Data
export const mockProducts = [
  {
    id: "1",
    name: "Premium Chicken Dog Food",
    slug: "premium-chicken-dog-food",
    description: "High-quality chicken formula for adult dogs with essential nutrients.",
    basePrice: 29.99,
    isActive: true,
    categoryId: "dog-food",
    variants: [
      { id: "1-1", productId: "1", size: "2kg", price: 29.99, stock: 150, sku: "DOG-CHK-2KG", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15" },
      { id: "1-2", productId: "1", size: "5kg", price: 59.99, stock: 85, sku: "DOG-CHK-5KG", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15" },
      { id: "1-3", productId: "1", size: "10kg", price: 99.99, stock: 42, sku: "DOG-CHK-10KG", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15" },
    ],
    attributes: [
      { id: "1-a1", productId: "1", key: "Protein", value: "28%" },
      { id: "1-a2", productId: "1", key: "Fat", value: "15%" },
      { id: "1-a3", productId: "1", key: "Fiber", value: "4%" },
      { id: "1-a4", productId: "1", key: "Age Group", value: "Adult" },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Salmon & Rice Cat Food",
    slug: "salmon-rice-cat-food",
    description: "Delicious salmon recipe with rice for healthy digestion.",
    basePrice: 18.99,
    isActive: true,
    categoryId: "cat-food",
    variants: [
      { id: "2-1", productId: "2", size: "1kg", price: 18.99, stock: 200, sku: "CAT-SAL-1KG", isActive: true, createdAt: "2024-02-10", updatedAt: "2024-02-10" },
      { id: "2-2", productId: "2", size: "3kg", price: 45.99, stock: 120, sku: "CAT-SAL-3KG", isActive: true, createdAt: "2024-02-10", updatedAt: "2024-02-10" },
    ],
    attributes: [
      { id: "2-a1", productId: "2", key: "Protein", value: "32%" },
      { id: "2-a2", productId: "2", key: "Fat", value: "18%" },
      { id: "2-a3", productId: "2", key: "Omega-3", value: "0.5%" },
      { id: "2-a4", productId: "2", key: "Age Group", value: "All Ages" },
    ],
    createdAt: "2024-02-10",
    updatedAt: "2024-02-10",
  },
  {
    id: "3",
    name: "Puppy Growth Formula",
    slug: "puppy-growth-formula",
    description: "Specially formulated for growing puppies with DHA for brain development.",
    basePrice: 24.99,
    isActive: true,
    categoryId: "dog-food",
    variants: [
      { id: "3-1", productId: "3", size: "1.5kg", price: 24.99, stock: 95, sku: "DOG-PUP-1.5KG", isActive: true, createdAt: "2024-02-20", updatedAt: "2024-02-20" },
      { id: "3-2", productId: "3", size: "4kg", price: 54.99, stock: 60, sku: "DOG-PUP-4KG", isActive: true, createdAt: "2024-02-20", updatedAt: "2024-02-20" },
    ],
    attributes: [
      { id: "3-a1", productId: "3", key: "Protein", value: "30%" },
      { id: "3-a2", productId: "3", key: "DHA", value: "0.1%" },
      { id: "3-a3", productId: "3", key: "Calcium", value: "1.2%" },
      { id: "3-a4", productId: "3", key: "Age Group", value: "Puppy" },
    ],
    createdAt: "2024-02-20",
    updatedAt: "2024-02-20",
  },
  {
    id: "4",
    name: "Senior Cat Wellness",
    slug: "senior-cat-wellness",
    description: "Low-calorie formula for senior cats with joint support.",
    basePrice: 32.99,
    isActive: false,
    categoryId: "cat-food",
    variants: [
      { id: "4-1", productId: "4", size: "2kg", price: 32.99, stock: 75, sku: "CAT-SEN-2KG", isActive: true, createdAt: "2024-03-05", updatedAt: "2024-03-05" },
    ],
    attributes: [
      { id: "4-a1", productId: "4", key: "Protein", value: "26%" },
      { id: "4-a2", productId: "4", key: "Glucosamine", value: "400mg/kg" },
      { id: "4-a3", productId: "4", key: "L-Carnitine", value: "50mg/kg" },
      { id: "4-a4", productId: "4", key: "Age Group", value: "Senior 7+" },
    ],
    createdAt: "2024-03-05",
    updatedAt: "2024-03-05",
  },
];

export const mockBanners = [
  {
    id: "1",
    title: "Spring Sale - 30% Off",
    description: "On all premium dog food",
    imageUrl: "/placeholder.svg?height=300&width=1200",
    link: "/collections/dog-food",
    position: "home",
    order: 1,
    isActive: true,
    createdAt: "2024-03-01",
    updatedAt: "2024-03-01",
  },
  {
    id: "2",
    title: "New Arrivals",
    description: "Check out our latest cat treats",
    imageUrl: "/placeholder.svg?height=300&width=1200",
    link: "/collections/cat-treats",
    position: "home",
    order: 2,
    isActive: true,
    createdAt: "2024-03-02",
    updatedAt: "2024-03-02",
  },
  {
    id: "3",
    title: "Free Shipping",
    description: "On orders over $50",
    imageUrl: "/placeholder.svg?height=300&width=1200",
    link: "/shipping",
    position: "home",
    order: 3,
    isActive: false,
    createdAt: "2024-03-03",
    updatedAt: "2024-03-03",
  },
];

export const mockCollections = [
  {
    id: "1",
    name: "Dog Food",
    slug: "dog-food",
    description: "Premium nutrition for your canine companion",
    imageUrl: "/placeholder.svg?height=200&width=200",
    isActive: true,
    createdAt: "2024-03-01",
    updatedAt: "2024-03-01",
  },
  {
    id: "2",
    name: "Cat Food",
    slug: "cat-food",
    description: "Delicious meals for your feline friend",
    imageUrl: "/placeholder.svg?height=200&width=200",
    isActive: true,
    createdAt: "2024-03-02",
    updatedAt: "2024-03-02",
  },
  {
    id: "3",
    name: "Treats & Snacks",
    slug: "treats-snacks",
    description: "Tasty rewards for good behavior",
    imageUrl: "/placeholder.svg?height=200&width=200",
    isActive: true,
    createdAt: "2024-03-03",
    updatedAt: "2024-03-03",
  },
  {
    id: "4",
    name: "Special Diets",
    slug: "special-diets",
    description: "Grain-free, hypoallergenic, and more",
    imageUrl: "/placeholder.svg?height=200&width=200",
    isActive: false,
    createdAt: "2024-03-04",
    updatedAt: "2024-03-04",
  },
];

export const mockBlogs = [
  {
    id: "1",
    title: "5 Signs Your Dog Needs a Diet Change",
    slug: "5-signs-dog-diet-change",
    excerpt: "Learn the key indicators that your furry friend might need different nutrition.",
    content: "Full article content here...",
    featuredImage: "/placeholder.svg?height=200&width=400",
    authorId: "author-1",
    isPublished: true,
    publishedAt: "2024-03-15",
    createdAt: "2024-03-15",
    updatedAt: "2024-03-15",
  },
  {
    id: "2",
    title: "The Benefits of Grain-Free Cat Food",
    slug: "benefits-grain-free-cat",
    excerpt: "Discover why grain-free options might be right for your cat.",
    content: "Full article content here...",
    featuredImage: "/placeholder.svg?height=200&width=400",
    authorId: "author-2",
    isPublished: true,
    publishedAt: "2024-03-10",
    createdAt: "2024-03-10",
    updatedAt: "2024-03-10",
  },
  {
    id: "3",
    title: "Summer Hydration Tips for Pets",
    slug: "summer-hydration-pets",
    excerpt: "Keep your pets healthy and hydrated during the hot months.",
    content: "Full article content here...",
    featuredImage: "/placeholder.svg?height=200&width=400",
    authorId: "author-1",
    isPublished: false,
    createdAt: "2024-03-20",
    updatedAt: "2024-03-20",
  },
];

export const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: "John Smith",
    email: "john.smith@email.com",
    items: [
      { productName: "Premium Chicken Dog Food", variant: "5kg", quantity: 2, price: 59.99 },
      { productName: "Dog Treats - Beef", variant: "250g", quantity: 1, price: 12.99 },
    ],
    total: 132.97,
    status: "delivered",
    paymentStatus: "paid",
    createdAt: "2024-03-18",
    shippingAddress: "123 Main St, New York, NY 10001",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: "Emily Davis",
    email: "emily.d@email.com",
    items: [
      { productName: "Salmon & Rice Cat Food", variant: "3kg", quantity: 1, price: 45.99 },
    ],
    total: 45.99,
    status: "shipped",
    paymentStatus: "paid",
    createdAt: "2024-03-19",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: "Michael Brown",
    email: "m.brown@email.com",
    items: [
      { productName: "Puppy Growth Formula", variant: "4kg", quantity: 1, price: 54.99 },
      { productName: "Puppy Treats", variant: "200g", quantity: 2, price: 9.99 },
    ],
    total: 74.97,
    status: "processing",
    paymentStatus: "paid",
    createdAt: "2024-03-20",
    shippingAddress: "789 Pine Rd, Chicago, IL 60601",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: "Sarah Johnson",
    email: "sarah.j@email.com",
    items: [
      { productName: "Senior Cat Wellness", variant: "2kg", quantity: 3, price: 32.99 },
    ],
    total: 98.97,
    status: "pending",
    paymentStatus: "pending",
    createdAt: "2024-03-21",
    shippingAddress: "321 Elm St, Houston, TX 77001",
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customer: "David Wilson",
    email: "d.wilson@email.com",
    items: [
      { productName: "Premium Chicken Dog Food", variant: "10kg", quantity: 1, price: 99.99 },
    ],
    total: 99.99,
    status: "cancelled",
    paymentStatus: "refunded",
    createdAt: "2024-03-17",
    shippingAddress: "654 Maple Dr, Phoenix, AZ 85001",
  },
];

export const mockComments: Comment[] = [
  {
    id: "1",
    productId: "1",
    productName: "Premium Chicken Dog Food",
    customer: "Alice Thompson",
    rating: 5,
    content: "My dog absolutely loves this food! His coat has never looked better.",
    status: "approved",
    createdAt: "2024-03-15",
  },
  {
    id: "2",
    productId: "2",
    productName: "Salmon & Rice Cat Food",
    customer: "Bob Martinez",
    rating: 4,
    content: "Good quality food, my cats enjoy it. Slightly pricey but worth it.",
    status: "approved",
    createdAt: "2024-03-16",
  },
  {
    id: "3",
    productId: "1",
    productName: "Premium Chicken Dog Food",
    customer: "Carol White",
    rating: 3,
    content: "Decent product but my dog took a while to adjust to the new food.",
    status: "pending",
    createdAt: "2024-03-18",
  },
  {
    id: "4",
    productId: "3",
    productName: "Puppy Growth Formula",
    customer: "Dan Lee",
    rating: 5,
    content: "Perfect for my growing puppy! Vet recommended and puppy approved.",
    status: "pending",
    createdAt: "2024-03-19",
  },
  {
    id: "5",
    productId: "2",
    productName: "Salmon & Rice Cat Food",
    customer: "Anonymous",
    rating: 1,
    content: "This is spam content that should be rejected.",
    status: "rejected",
    createdAt: "2024-03-20",
  },
];

// Stats for dashboard
export const dashboardStats = {
  totalRevenue: 12847.50,
  totalOrders: 156,
  totalProducts: 48,
  totalCustomers: 234,
  revenueChange: 12.5,
  ordersChange: 8.2,
  productsChange: 4,
  customersChange: 15.3,
};

export const revenueData = [
  { month: "Jan", revenue: 4200, orders: 42 },
  { month: "Feb", revenue: 5100, orders: 51 },
  { month: "Mar", revenue: 4800, orders: 48 },
  { month: "Apr", revenue: 6200, orders: 62 },
  { month: "May", revenue: 5800, orders: 58 },
  { month: "Jun", revenue: 7100, orders: 71 },
];

export const categoryData = [
  { name: "Dog Food", value: 45 },
  { name: "Cat Food", value: 30 },
  { name: "Treats", value: 15 },
  { name: "Other", value: 10 },
];
