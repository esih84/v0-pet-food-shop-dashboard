import { mockBlogs } from '@/lib/data'
import type { Blog } from '@/lib/types'

export async function GET() {
  try {
    return Response.json(mockBlogs)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newBlog: Blog = {
      id: `blog_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockBlogs.push(newBlog)
    
    return Response.json(newBlog, { status: 201 })
  } catch (error) {
    return Response.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    )
  }
}
