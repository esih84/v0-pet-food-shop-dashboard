import { comments } from '@/lib/data'
import type { Comment } from '@/lib/data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comment = comments.find((c) => c.id === params.id)
    
    if (!comment) {
      return Response.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    return Response.json(comment)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch comment' },
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
    const index = comments.findIndex((c) => c.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    const updatedComment: Comment = {
      ...comments[index],
      ...body,
      id: comments[index].id,
      createdAt: comments[index].createdAt,
      updatedAt: new Date().toISOString(),
    }
    
    comments[index] = updatedComment
    
    return Response.json(updatedComment)
  } catch (error) {
    return Response.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = comments.findIndex((c) => c.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    comments.splice(index, 1)
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
