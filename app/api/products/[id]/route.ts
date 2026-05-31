import { products } from '@/lib/data'
import type { Product } from '@/lib/data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = products.find((p) => p.id === params.id)
    
    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return Response.json(product)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const index = products.findIndex((p) => p.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    const updatedProduct: Product = {
      ...products[index],
      ...body,
      id: products[index].id,
      createdAt: products[index].createdAt,
      updatedAt: new Date().toISOString(),
    }
    
    products[index] = updatedProduct
    
    return Response.json(updatedProduct)
  } catch (error) {
    return Response.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = products.findIndex((p) => p.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    products.splice(index, 1)
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
