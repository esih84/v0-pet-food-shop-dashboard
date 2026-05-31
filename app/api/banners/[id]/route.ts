import { mockBanners } from '@/lib/data'
import type { Banner } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const banner = mockBanners.find((b) => b.id === params.id)
    
    if (!banner) {
      return Response.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }
    
    return Response.json(banner)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch banner' },
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
    const index = mockBanners.findIndex((b) => b.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }
    
    const updatedBanner: Banner = {
      ...banners[index],
      ...body,
      id: banners[index].id,
      createdAt: banners[index].createdAt,
      updatedAt: new Date().toISOString(),
    }
    
    banners[index] = updatedBanner
    
    return Response.json(updatedBanner)
  } catch (error) {
    return Response.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockBanners.findIndex((b) => b.id === params.id)
    
    if (index === -1) {
      return Response.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }
    
    mockBanners.splice(index, 1)
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    )
  }
}
