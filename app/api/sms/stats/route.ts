import { NextResponse } from 'next/server'

export async function GET() {
  // Mock SMS statistics
  const stats = {
    totalSent: 15234,
    totalFailed: 342,
    successRate: 97.8,
    todaysSent: 234,
    thisMonthsSent: 5234,
    templates: {
      order: 4234,
      customer: 3421,
      promotion: 5234,
      reminder: 2345,
    },
    topTemplate: {
      name: 'Order Confirmation',
      sent: 4234,
      failed: 45,
    },
    averageDeliveryTime: '2.3s',
    credits: {
      total: 10000,
      used: 5234,
      remaining: 4766,
      percentageUsed: 52.34,
    },
  }

  return NextResponse.json(stats)
}
