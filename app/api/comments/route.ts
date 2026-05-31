import { comments } from '@/lib/data'

export async function GET() {
  try {
    return Response.json(comments)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
