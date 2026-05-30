import { pgTable, text, timestamp, boolean, integer, decimal, jsonb, serial } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Example:
//
// import { serial } from "drizzle-orm/pg-core"
//
// export const todos = pgTable("todos", {
//   id: serial("id").primaryKey(),
//   userId: text("userId").notNull(),
//   title: text("title").notNull(),
//   completed: boolean("completed").notNull().default(false),
//   createdAt: timestamp("createdAt").notNull().defaultNow(),
// })
//
// If the user asks for foreign keys, add the reference back in:
//   userId: text("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),

// --- Products Table -------------------------------------------------------
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  sku: text('sku').notNull().unique(),
  basePrice: decimal('basePrice', { precision: 10, scale: 2 }).notNull(),
  image: text('image'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Product Variants Table -----------------------------------------------
export const productVariants = pgTable('productVariants', {
  id: serial('id').primaryKey(),
  productId: integer('productId').notNull(),
  userId: text('userId').notNull(),
  size: text('size').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(0),
  sku: text('sku').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Product Attributes Table (Key-Value) ---------------------------------
export const productAttributes = pgTable('productAttributes', {
  id: serial('id').primaryKey(),
  productId: integer('productId').notNull(),
  userId: text('userId').notNull(),
  key: text('key').notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// --- Banners Table --------------------------------------------------------
export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  image: text('image'),
  link: text('link'),
  position: integer('position').notNull().default(0),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Collections Table --------------------------------------------------
export const collections = pgTable('collections', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Blogs Table -------------------------------------------------------
export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  author: text('author'),
  tags: text('tags'),
  featuredImage: text('featuredImage'),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Orders Table ------------------------------------------------------
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  orderNumber: text('orderNumber').notNull().unique(),
  customerEmail: text('customerEmail').notNull(),
  customerName: text('customerName').notNull(),
  totalAmount: decimal('totalAmount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'),
  shippingAddress: text('shippingAddress'),
  items: jsonb('items'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Comments/Reviews Table ------------------------------------------
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  productId: integer('productId').notNull(),
  customerEmail: text('customerEmail').notNull(),
  customerName: text('customerName').notNull(),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- SMS Configuration Table -----------------------------------------
export const smsConfig = pgTable('smsConfig', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  provider: text('provider').notNull(),
  apiKey: text('apiKey').notNull(),
  apiSecret: text('apiSecret'),
  senderName: text('senderName').notNull(),
  isActive: boolean('isActive').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- SMS Templates Table -----------------------------------------------
export const smsTemplates = pgTable('smsTemplates', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  template: text('template').notNull(),
  variables: text('variables'),
  type: text('type').notNull(),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- SMS Logs Table ---------------------------------------------------
export const smsLogs = pgTable('smsLogs', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  phoneNumber: text('phoneNumber').notNull(),
  message: text('message').notNull(),
  templateId: integer('templateId'),
  status: text('status').notNull().default('pending'),
  responseCode: text('responseCode'),
  errorMessage: text('errorMessage'),
  sentAt: timestamp('sentAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
