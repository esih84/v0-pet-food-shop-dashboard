# SMS Management System - Implementation Guide

## Overview
A complete SMS management system integrated with React Query for efficient data fetching and caching. The system allows admins to manage SMS templates, view statistics, send test messages, and monitor SMS delivery.

## Architecture

### Technology Stack
- **Client State Management**: TanStack React Query v5 - automatic caching, background refetching, and data synchronization
- **API Layer**: Next.js API Routes - RESTful endpoints for CRUD operations
- **Data Storage**: Mock in-memory database (easily replaceable with real database)
- **UI Framework**: React with TypeScript

### Key Features

#### 1. **Template Management**
- Create, read, update, and delete SMS templates
- Support for dynamic variables (e.g., `{{customerName}}`, `{{orderId}}`)
- Automatic variable extraction from message content
- Category-based organization (Order, Customer, Promotion, Reminder)
- Active/Inactive status management

#### 2. **React Query Integration**
All data operations use React Query hooks with automatic:
- Cache management (5-minute stale time)
- Background refetching
- Automatic invalidation on mutations
- Loading and error states

#### 3. **SMS Statistics Dashboard**
- Total sent/failed messages
- Daily and monthly analytics
- Success rates and delivery metrics
- Messages by category breakdown
- SMS credit tracking
- Top performing templates

#### 4. **Test SMS Functionality**
- Send test messages to verify templates
- Phone number validation
- Variable substitution support
- Delivery status tracking

## File Structure

```
app/
├── providers.tsx                          # QueryClientProvider setup
├── api/sms/
│   ├── templates/
│   │   ├── route.ts                      # GET all, POST create
│   │   └── [id]/route.ts                 # GET one, PUT update, DELETE
│   ├── send-test/route.ts                # POST test SMS
│   └── stats/route.ts                    # GET statistics
├── (dashboard)/
│   └── sms/
│       └── page.tsx                      # SMS management UI
lib/
├── hooks/
│   └── use-sms.ts                        # React Query hooks
```

## React Query Hooks

### useSMSTemplates()
Fetch all SMS templates with caching and automatic refetching.

```typescript
const { data: templates, isLoading, error } = useSMSTemplates()
```

### useSMSTemplate(id)
Fetch a single template by ID.

```typescript
const { data: template } = useSMSTemplate(templateId)
```

### useCreateSMSTemplate()
Create a new template and automatically invalidate the templates list.

```typescript
const mutation = useCreateSMSTemplate()
await mutation.mutateAsync({ name, title, content, category })
```

### useUpdateSMSTemplate(id)
Update an existing template with automatic cache invalidation.

```typescript
const mutation = useUpdateSMSTemplate(templateId)
await mutation.mutateAsync({ name, title, content })
```

### useDeleteSMSTemplate()
Delete a template and refresh the list.

```typescript
const mutation = useDeleteSMSTemplate()
await mutation.mutateAsync(templateId)
```

### useSendTestSMS()
Send a test SMS to verify template content.

```typescript
const mutation = useSendTestSMS()
await mutation.mutateAsync({ templateId, phoneNumber, variables })
```

### useSMSStats()
Fetch SMS statistics and analytics.

```typescript
const { data: stats } = useSMSStats()
```

## API Endpoints

### GET /api/sms/templates
Returns all SMS templates.

**Response:**
```json
[
  {
    "id": "1",
    "name": "Order Confirmation",
    "title": "Order Confirmed",
    "content": "Hi {{customerName}}, your order #{{orderId}} has been confirmed.",
    "variables": ["customerName", "orderId"],
    "category": "order",
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/sms/templates
Create a new template.

**Request Body:**
```json
{
  "name": "New Template",
  "title": "Template Title",
  "content": "Hi {{name}}, message content...",
  "category": "order"
}
```

### PUT /api/sms/templates/[id]
Update a template.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "content": "Updated content...",
  "active": false
}
```

### DELETE /api/sms/templates/[id]
Delete a template.

### POST /api/sms/send-test
Send a test SMS.

**Request Body:**
```json
{
  "templateId": "1",
  "phoneNumber": "+1234567890",
  "variables": { "name": "John" }
}
```

### GET /api/sms/stats
Returns SMS statistics.

**Response:**
```json
{
  "totalSent": 15234,
  "totalFailed": 342,
  "successRate": 97.8,
  "todaysSent": 234,
  "thisMonthsSent": 5234,
  "templates": {
    "order": 4234,
    "customer": 3421,
    "promotion": 5234,
    "reminder": 2345
  },
  "topTemplate": { "name": "Order Confirmation", "sent": 4234 },
  "credits": { "total": 10000, "used": 5234, "remaining": 4766 }
}
```

## Configuration

### React Query Cache Settings

In `app/providers.tsx`:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      gcTime: 1000 * 60 * 10,           // 10 minutes
    },
  },
})
```

**Adjust these values based on your needs:**
- `staleTime`: How long data is considered fresh
- `gcTime`: How long to keep unused data in cache before garbage collection

## Integration with Real Database

### Replacing Mock Database

Currently, the API endpoints use a mock in-memory database. To integrate with a real database:

1. **Install your database client:**
```bash
pnpm add pg                    # PostgreSQL
# or
pnpm add @supabase/supabase-js # Supabase
```

2. **Update `/api/sms/templates/route.ts`:**
```typescript
import { db } from '@/lib/db'

export async function GET() {
  const templates = await db.smsTemplate.findMany()
  return NextResponse.json(templates)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const template = await db.smsTemplate.create({ data: body })
  return NextResponse.json(template, { status: 201 })
}
```

3. **Update other endpoints similarly** (PUT, DELETE, etc.)

## Sidebar Navigation

The SMS Management link is automatically added to the sidebar at `/sms`. The icon uses `MessageCircle` from lucide-react.

## UI Features

### Templates Tab
- **Search & Filter**: Search by name/content and filter by category
- **Template Cards**: Display template details with status badges
- **Quick Actions**: Edit, Delete, and Send Test buttons
- **Variable Display**: Shows all variables used in the template
- **Create Modal**: Full form with validation

### Statistics Tab
- **Key Metrics**: Total sent, today's sent, failed, delivery time
- **Category Breakdown**: Pie chart-style visualization by category
- **Credit Management**: Shows credit usage and remaining balance
- **Top Template**: Highlights best-performing template

## Best Practices

### 1. Query Key Convention
```typescript
// Always use consistent query keys
'sms-templates'           // List of all templates
'sms-template', id        // Single template
'sms-stats'              // Statistics
```

### 2. Mutation Invalidation
```typescript
// Always invalidate related queries after mutations
queryClient.invalidateQueries({ queryKey: ['sms-templates'] })
queryClient.invalidateQueries({ queryKey: ['sms-template', id] })
```

### 3. Error Handling
```typescript
// Always provide user feedback
if (error) {
  // Show error message in UI
}
```

### 4. Loading States
```typescript
// Show loading indicators during data fetching
if (isLoading) {
  // Show skeleton or spinner
}
```

## Testing

To test the SMS management system:

1. Navigate to `/sms` in your dashboard
2. Create a new template with test variables
3. Send a test SMS to verify the system works
4. Update and delete templates
5. Check the Statistics tab for analytics

## Future Enhancements

1. **Real SMS Provider Integration**
   - Twilio, AWS SNS, or other SMS providers
   - Actual message delivery and tracking

2. **Scheduled Messages**
   - Send templates on schedule
   - Batch sending capabilities

3. **Advanced Analytics**
   - Delivery rate tracking
   - Response tracking (for 2-way SMS)
   - Campaign analytics

4. **Template Variables**
   - Support for conditional logic
   - Template blocks and includes
   - Multi-language support

5. **Audit Logging**
   - Track all template changes
   - User activity logging
   - Delivery logs

## Troubleshooting

### Query not updating after mutation
- Ensure mutation calls `queryClient.invalidateQueries()`
- Check query key matches between useQuery and invalidation

### Stale data
- Adjust `staleTime` in query client configuration
- Use `refetchInterval` for real-time updates

### Phone number validation failing
- Update regex in `/api/sms/send-test/route.ts`
- Current pattern: `/^\+?[0-9]{10,15}$/`

## Support

For issues or questions, refer to:
- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- Project code comments and examples
