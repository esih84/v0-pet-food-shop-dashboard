import { mockOrders } from '@/lib/data'

export async function GET() {
  try {
    return Response.json(mockOrders)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
