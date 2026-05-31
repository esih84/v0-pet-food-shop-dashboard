import { orders } from '@/lib/data'

export async function GET() {
  try {
    return Response.json(orders)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
