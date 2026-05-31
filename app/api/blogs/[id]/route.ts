import { blogs } from '@/lib/data'
import type { Blog } from '@/lib/data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const blog = blogs.find((b) => b.id === params.id)
    
    if (!blog) {
      return Response.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    return Response.json(blog)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch blog' },
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
    const index = blogs.findIndex((b) => b.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    const updatedBlog: Blog = {
      ...blogs[index],
      ...body,
      id: blogs[index].id,
      createdAt: blogs[index].createdAt,
      updatedAt: new Date().toISOString(),
    }
    
    blogs[index] = updatedBlog
    
    return Response.json(updatedBlog)
  } catch (error) {
    return Response.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = blogs.findIndex((b) => b.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    blogs.splice(index, 1)
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    )
  }
}
