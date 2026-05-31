import { mockCollections } from '@/lib/data'
import type { Collection } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const collection = mockCollections.find((c) => c.id === params.id)
    
    if (!collection) {
      return Response.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }
    
    return Response.json(collection)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch collection' },
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
    const index = mockCollections.findIndex((c) => c.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }
    
    const updatedCollection: Collection = {
      ...collections[index],
      ...body,
      id: collections[index].id,
      createdAt: collections[index].createdAt,
      updatedAt: new Date().toISOString(),
    }
    
    collections[index] = updatedCollection
    
    return Response.json(updatedCollection)
  } catch (error) {
    return Response.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockCollections.findIndex((c) => c.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }
    
    mockCollections.splice(index, 1)
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    )
  }
}
