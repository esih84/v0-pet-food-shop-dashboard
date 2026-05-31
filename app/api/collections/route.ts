import { mockCollections } from '@/lib/data'
import type { Collection } from '@/lib/types'

export async function GET() {
  try {
    return Response.json(mockCollections)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newCollection: Collection = {
      id: `coll_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockCollections.push(newCollection)
    
    return Response.json(newCollection, { status: 201 })
  } catch (error) {
    return Response.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}
