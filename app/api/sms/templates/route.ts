import { NextRequest, NextResponse } from 'next/server'

// Mock database - in production, this would be your actual database
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

// GET all templates
export async function GET() {
  return NextResponse.json(smsTemplates)
}

// POST create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, title, content, category } = body

    // Extract variables from content (format: {{variable}})
    const variableRegex = /\{\{(\w+)\}\}/g
    const variables: string[] = []
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    const newTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      title,
      content,
      variables,
      category,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    smsTemplates.push(newTemplate)
    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create SMS template' },
      { status: 400 }
    )
  }
}
