import { mockOrders } from '@/lib/data'
import type { Order } from '@/lib/data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = mockOrders.find((o) => o.id === params.id)
    
    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    return Response.json(order)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch order' },
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
    const index = mockOrders.findIndex((o) => o.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    const updatedOrder: Order = {
      ...orders[index],
      ...body,
      id: orders[index].id,
      createdAt: orders[index].createdAt,
      updatedAt: new Date().toISOString(),
    }
    
    orders[index] = updatedOrder
    
    return Response.json(updatedOrder)
  } catch (error) {
    return Response.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockOrders.findIndex((o) => o.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    mockOrders.splice(index, 1)
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
