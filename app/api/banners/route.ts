import { mockBanners } from '@/lib/data'
import type { Banner } from '@/lib/types'

export async function GET() {
  try {
    return Response.json(mockBanners)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newBanner: Banner = {
      id: `banner_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockBanners.push(newBanner)
    
    return Response.json(newBanner, { status: 201 })
  } catch (error) {
    return Response.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}
