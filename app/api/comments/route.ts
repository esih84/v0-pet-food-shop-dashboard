import { mockComments } from '@/lib/data'

export async function GET() {
  try {
    return Response.json(mockComments)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
