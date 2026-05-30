import { NextRequest, NextResponse } from 'next/server'

// Mock database - shared with main templates route
let smsTemplates = [
  {
    id: '1',
    name: 'Order Confirmation',
    title: 'Order Confirmed',
    content: 'Hi {{customerName}}, your order #{{orderId}} has been confirmed. Total: {{amount}}. Track here: {{trackingUrl}}',
    variables: ['customerName', 'orderId', 'amount', 'trackingUrl'],
    category: 'order' as const,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Shipping Notification',
    title: 'Order Shipped',
    content: 'Hi {{customerName}}, your order #{{orderId}} is on its way! Tracking: {{trackingNumber}}',
    variables: ['customerName', 'orderId', 'trackingNumber'],
    category: 'order' as const,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Special Offer',
    title: 'Exclusive Discount',
    content: '{{customerName}}, get {{discount}}% off on premium pet food! Use code {{code}}. Offer valid until {{expiryDate}}',
    variables: ['customerName', 'discount', 'code', 'expiryDate'],
    category: 'promotion' as const,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Abandoned Cart',
    title: 'Complete Your Purchase',
    content: 'Hi {{customerName}}, you left {{itemCount}} items in your cart. Complete checkout and get {{discountCode}} off!',
    variables: ['customerName', 'itemCount', 'discountCode'],
    category: 'reminder' as const,
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// GET single template
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const template = smsTemplates.find((t) => t.id === params.id)

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  return NextResponse.json(template)
}

// PUT update template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const templateIndex = smsTemplates.findIndex((t) => t.id === params.id)

    if (templateIndex === -1) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const existingTemplate = smsTemplates[templateIndex]
    const updatedContent = body.content || existingTemplate.content

    // Extract variables from content
    const variableRegex = /\{\{(\w+)\}\}/g
    const variables: string[] = []
    let match

    while ((match = variableRegex.exec(updatedContent)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    const updatedTemplate = {
      ...existingTemplate,
      ...body,
      variables,
      updatedAt: new Date().toISOString(),
    }

    smsTemplates[templateIndex] = updatedTemplate
    return NextResponse.json(updatedTemplate)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update SMS template' },
      { status: 400 }
    )
  }
}

// DELETE template
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const templateIndex = smsTemplates.findIndex((t) => t.id === params.id)

  if (templateIndex === -1) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  const deletedTemplate = smsTemplates[templateIndex]
  smsTemplates = smsTemplates.filter((t) => t.id !== params.id)

  return NextResponse.json(deletedTemplate)
}
