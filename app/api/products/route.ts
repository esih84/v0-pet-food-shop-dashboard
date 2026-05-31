import { mockProducts } from '@/lib/data'
import type { Product } from '@/lib/types'

export async function GET() {
  try {
    return Response.json(mockProducts)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // In a real app, save to database
    mockProducts.push(newProduct)
    
    return Response.json(newProduct, { status: 201 })
  } catch (error) {
    return Response.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
