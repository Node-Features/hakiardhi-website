# Campaign Messaging & Activity Notifications Implementation
## HakiArdhi Digital Ecosystem

**Date:** November 29, 2025
**Version:** 1.0
**Status:** Implemented

---

## Overview

This document describes the implementation of:
1. **Campaign Messages API** - Manual message sending from admin portal
2. **Activity Assignment Notifications** - Updated to use Bird service with WhatsApp/SMS fallback

### Key Features

✅ Multi-channel delivery (SMS, WhatsApp, Email)
✅ Intelligent recipient selection (all, donors, subscribers, beneficiaries, staff, custom)
✅ Bird batch API integration for efficient delivery
✅ Message job tracking via `message_jobs` table
✅ WhatsApp primary with SMS fallback for activity assignments
✅ Comprehensive error handling and logging
✅ Rate limiting and delivery status tracking

---

## 1. Campaign Messages API

### Endpoint

**POST** `/api/admin/campaigns/send`

### Purpose

Manual trigger from admin portal to send bulk messages to selected recipients via SMS, WhatsApp, or Email.

### Request Body

```typescript
{
  "campaignId": "uuid",              // Optional: Link to campaign
  "message": "string",               // Message text (1-1600 chars)
  "subject": "string",               // Optional: Email subject
  "channels": ["sms" | "whatsapp" | "email"],  // Array of channels
  "recipientType": "all" | "selected" | "donors" | "subscribers" | "beneficiaries" | "staff",
  "recipientIds": ["uuid"],          // Required if recipientType is "selected"
  "templateId": "string",            // Optional: Bird template ID
  "templateParams": {                // Optional: Template variables
    "key": "value"
  },
  "metadata": {}                     // Optional: Custom tracking data
}
```

### Response

```json
{
  "success": true,
  "message": "Campaign messages sent",
  "data": {
    "jobId": "uuid",
    "totalRecipients": 150,
    "sent": 148,
    "failed": 2,
    "channels": ["whatsapp", "sms"]
  }
}
```

### Recipient Selection

The API supports intelligent recipient filtering:

| Type | Description | Source |
|------|-------------|--------|
| `all` | All users in the system | `users` table |
| `selected` | Specific users by ID | `recipientIds` parameter |
| `donors` | Users who made donations | `donations` table |
| `subscribers` | Newsletter subscribers | `newsletter_subscriptions` table |
| `beneficiaries` | Activity beneficiaries | `users.role = 'beneficiary'` |
| `staff` | Staff members | `users.role IN ('admin', 'staff', 'moderator')` |

### Channel Priority

The API automatically selects the best available channel for each recipient:

1. **WhatsApp** (if channel enabled and user has phone)
2. **SMS** (if channel enabled and user has phone)
3. **Email** (if channel enabled and user has email)

### Message Personalization

Messages support dynamic placeholders:

- `{first_name}` - Recipient's first name
- `{last_name}` - Recipient's last name
- `{full_name}` - Full name
- `{email}` - Email address

**Example:**
```
Input: "Habari {first_name}, tunaomba msaada wako..."
Output: "Habari John, tunaomba msaada wako..."
```

### Batch Processing

- Messages are sent in batches of **100** to respect API limits
- Uses `birdService.sendBulk()` for parallel processing
- 1-second delay between batches to avoid rate limiting

### Message Job Tracking

All campaign sends are tracked in the `message_jobs` table:

```sql
{
  "id": "uuid",
  "campaign_id": "uuid",
  "job_type": "campaign_message",
  "channels": ["whatsapp", "sms"],
  "recipient_count": 150,
  "sent_count": 148,
  "failed_count": 2,
  "status": "completed" | "processing" | "failed" | "partially_completed",
  "metadata": {
    "recipientType": "donors",
    "message": "...",
    "results": [...]
  },
  "created_at": "timestamp",
  "completed_at": "timestamp"
}
```

### Get Campaign History

**GET** `/api/admin/campaigns/send?campaignId={uuid}&limit=50&offset=0`

Returns paginated history of all campaign sends.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "campaign_id": "uuid",
      "job_type": "campaign_message",
      "channels": ["sms"],
      "recipient_count": 200,
      "sent_count": 198,
      "failed_count": 2,
      "status": "completed",
      "created_at": "2025-11-29T10:00:00Z",
      "completed_at": "2025-11-29T10:05:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 50,
    "offset": 0
  }
}
```

---

## 2. Activity Assignment Notifications

### Updated File

`Backend/v1/src/app/api/admin/activities/[id]/assignments/route.ts`

### Changes Made

#### Before (Old Implementation)
```typescript
// Used offloadMessageJob() via task-offloader
const jobResult = await offloadMessageJob({
  entityType: 'activity_assignment',
  entityId: data.id,
  jobType: 'message',
  title: 'Activity Assignment Notification',
  recipients: messagePayload
});
```

#### After (New Implementation)
```typescript
// Uses Bird service with WhatsApp > SMS fallback
await sendActivityAssignmentNotification({
  user: data.users,
  activity: data.activities,
  dueDate: data.due_date,
});
```

### Notification Flow

```
┌─────────────────────┐
│  Activity Assigned  │
└──────────┬──────────┘
           │
           v
┌─────────────────────────────┐
│ Check user has phone number │
└──────────┬──────────────────┘
           │
           v
┌─────────────────────────────┐
│   Try WhatsApp (Primary)    │
└──────────┬──────────────────┘
           │
      ┌────┴────┐
      │         │
   Success    Failed
      │         │
      │         v
      │    ┌─────────────────┐
      │    │  Fallback: SMS  │
      │    └────┬────────────┘
      │         │
      │    ┌────┴────┐
      │    │         │
      │ Success    Failed
      │    │         │
      v    v         v
┌──────────────────────────┐
│  Track in message_jobs   │
└──────────────────────────┘
```

### Notification Message Format

**Language:** Swahili
**Format:**
```
Habari {first_name}, umepewa kazi mpya: "{activity_name}".
Kamili kabla ya {due_date}. - HakiArdhi
```

**Example:**
```
Habari John, umepewa kazi mpya: "Community Survey - Dodoma".
Kamili kabla ya 15 Desemba 2025. - HakiArdhi
```

### WhatsApp Benefits

- ✅ **Instant delivery** - Faster than SMS
- ✅ **Read receipts** - Know when user saw message
- ✅ **Rich formatting** - Better user experience
- ✅ **Lower cost** - Often cheaper than SMS
- ✅ **Two-way communication** - Users can reply

### SMS Fallback

Automatic fallback occurs when:
- WhatsApp delivery fails
- User doesn't have WhatsApp
- Bird WhatsApp API error
- Rate limit exceeded

### Tracking & Logging

#### Success Cases

**WhatsApp Success:**
```typescript
{
  job_type: 'activity_assignment',
  channels: ['whatsapp'],
  recipient_count: 1,
  sent_count: 1,
  status: 'completed',
  metadata: {
    userId: "uuid",
    activityId: "uuid",
    activityName: "Community Survey",
    messageId: "bird_msg_123"
  }
}
```

**SMS Fallback Success:**
```typescript
{
  job_type: 'activity_assignment',
  channels: ['sms'],
  recipient_count: 1,
  sent_count: 1,
  status: 'completed',
  metadata: {
    userId: "uuid",
    activityId: "uuid",
    activityName: "Community Survey",
    messageId: "bird_msg_456",
    fallbackFrom: 'whatsapp'  // Indicates fallback occurred
  }
}
```

#### Failure Cases

**Complete Failure:**
```typescript
{
  job_type: 'activity_assignment',
  channels: ['sms', 'whatsapp'],
  recipient_count: 1,
  failed_count: 1,
  status: 'failed',
  metadata: {
    userId: "uuid",
    activityId: "uuid",
    error: "Invalid phone number"
  }
}
```

### Log Outputs

```bash
# WhatsApp attempt
[INFO] Attempting WhatsApp notification to +255712345678 | ACTIVITY_NOTIFICATION

# WhatsApp success
[INFO] WhatsApp notification sent successfully to John | ACTIVITY_NOTIFICATION

# WhatsApp failure -> SMS fallback
[WARN] WhatsApp failed (Rate limit exceeded), falling back to SMS | ACTIVITY_NOTIFICATION

# SMS success
[INFO] SMS notification sent successfully to John | ACTIVITY_NOTIFICATION

# Complete failure
[ERROR] SMS fallback also failed | ACTIVITY_NOTIFICATION
```

---

## Database Schema

### message_jobs Table

```sql
CREATE TABLE message_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES donation_campaigns(id),
  job_type VARCHAR(50) NOT NULL,  -- 'campaign_message' | 'activity_assignment'
  channels TEXT[] NOT NULL,       -- Array: ['sms', 'whatsapp', 'email']
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status VARCHAR(30) NOT NULL,    -- 'processing' | 'completed' | 'failed' | 'partially_completed'
  metadata JSONB,                 -- Custom tracking data
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  INDEX idx_message_jobs_campaign (campaign_id),
  INDEX idx_message_jobs_type (job_type),
  INDEX idx_message_jobs_status (status),
  INDEX idx_message_jobs_created (created_at DESC)
);
```

**Required Indexes:**
- `campaign_id` - For filtering by campaign
- `job_type` - For filtering by notification type
- `status` - For monitoring active/failed jobs
- `created_at DESC` - For chronological queries

---

## Integration Guide

### 1. Admin Portal UI

Create a campaign messaging interface:

```tsx
// Frontend/Admin_Portal/src/pages/campaigns/send.tsx

import { useState } from 'react';

export default function CampaignSendPage() {
  const [formData, setFormData] = useState({
    message: '',
    channels: ['whatsapp'],
    recipientType: 'donors',
  });

  const handleSend = async () => {
    const response = await fetch('/api/admin/campaigns/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      alert(`Sent to ${result.data.sent}/${result.data.totalRecipients} recipients`);
    }
  };

  return (
    <div>
      <h1>Send Campaign Message</h1>

      <textarea
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Enter your message..."
        maxLength={1600}
      />

      <select
        multiple
        value={formData.channels}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, option => option.value);
          setFormData({ ...formData, channels: selected });
        }}
      >
        <option value="whatsapp">WhatsApp</option>
        <option value="sms">SMS</option>
        <option value="email">Email</option>
      </select>

      <select
        value={formData.recipientType}
        onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
      >
        <option value="all">All Users</option>
        <option value="donors">Donors</option>
        <option value="subscribers">Newsletter Subscribers</option>
        <option value="beneficiaries">Beneficiaries</option>
        <option value="staff">Staff</option>
      </select>

      <button onClick={handleSend}>Send Campaign</button>
    </div>
  );
}
```

### 2. Environment Variables

Ensure Bird API credentials are set:

```bash
# .env.local
BIRD_API_KEY=AccessKey_xxxxxxxxxxxxx
BIRD_WORKSPACE_ID=wsp_xxxxxxxxxxxxx
BIRD_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Testing

#### Test Campaign Send

```bash
curl -X POST http://localhost:3000/api/admin/campaigns/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Habari! Tunaomba msaada wako kwa kampeni yetu ya haki za ardhi.",
    "channels": ["whatsapp", "sms"],
    "recipientType": "selected",
    "recipientIds": ["user-uuid-1", "user-uuid-2"]
  }'
```

#### Test Activity Assignment

```bash
curl -X POST http://localhost:3000/api/admin/activities/{activity-id}/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "due_date": "2025-12-31"
  }'
```

---

## Monitoring & Analytics

### Query Job Statistics

```sql
-- Campaign success rate (last 30 days)
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_jobs,
  SUM(sent_count) as total_sent,
  SUM(failed_count) as total_failed,
  ROUND(AVG(sent_count::NUMERIC / NULLIF(recipient_count, 0) * 100), 2) as success_rate
FROM message_jobs
WHERE job_type = 'campaign_message'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Channel Performance

```sql
-- Which channels work best?
SELECT
  unnest(channels) as channel,
  COUNT(*) as jobs,
  SUM(sent_count) as successful_sends,
  SUM(failed_count) as failed_sends
FROM message_jobs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY channel
ORDER BY successful_sends DESC;
```

### Failed Jobs

```sql
-- Recent failures for investigation
SELECT
  id,
  job_type,
  channels,
  recipient_count,
  failed_count,
  metadata->>'error' as error,
  created_at
FROM message_jobs
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## Best Practices

### 1. Message Content

✅ **DO:**
- Keep messages under 160 characters for SMS
- Use clear, actionable language
- Include sender identification (- HakiArdhi)
- Personalize with recipient name
- Use Swahili for Tanzanian audience

❌ **DON'T:**
- Use excessive emojis
- Include unsubscribe links (use Bird's built-in)
- Send promotional content without consent
- Use ALL CAPS (appears spammy)

### 2. Timing

✅ **Best Times:**
- Weekdays: 9 AM - 6 PM
- Avoid early mornings (< 8 AM)
- Avoid late evenings (> 9 PM)
- Consider time zones

### 3. Frequency

✅ **Recommended:**
- Max 1 campaign per week
- Activity notifications: As needed
- Emergency alerts: Immediate

❌ **Avoid:**
- Daily campaign messages
- Multiple messages in quick succession
- Sending to users who opted out

### 4. Testing

Before sending to all recipients:
1. Send test to yourself
2. Send to small group (10-20)
3. Check delivery status after 5 minutes
4. Review any failures
5. Proceed with full send

---

## Troubleshooting

### Common Issues

#### 1. "Rate limit exceeded"

**Cause:** Too many messages sent too quickly
**Solution:** Reduce batch size or add delays

```typescript
// Adjust in bird.service.ts
const batchSize = 50; // Reduce from 100
await this.delay(2000); // Increase delay to 2s
```

#### 2. "Invalid phone number"

**Cause:** Phone number not in E.164 format
**Solution:** Bird service automatically formats Tanzanian numbers

```typescript
// Handles these formats:
0712345678 -> +255712345678
712345678 -> +255712345678
255712345678 -> +255712345678
```

#### 3. "Template not found"

**Cause:** Bird template ID doesn't exist
**Solution:** Verify template in Bird dashboard or use plain text

```typescript
// Use plain text instead
{
  content: { text: "Your message" }
}
```

#### 4. WhatsApp always failing

**Cause:** WhatsApp Business Account not connected
**Solution:**
1. Log into Bird dashboard
2. Go to Channels → WhatsApp
3. Connect your WhatsApp Business Account
4. Verify phone number

---

## Future Enhancements

### Planned Features

1. **Scheduled Campaigns**
   - Queue messages for future delivery
   - Recurring campaigns (weekly, monthly)
   - Time zone awareness

2. **A/B Testing**
   - Send variant messages to subsets
   - Track engagement metrics
   - Auto-select winning variant

3. **Rich Media**
   - Image attachments (WhatsApp)
   - PDF receipts (Email)
   - Video links (All channels)

4. **Advanced Analytics**
   - Delivery rate charts
   - Click-through tracking
   - Conversion funnel

5. **Segmentation**
   - Geographic targeting
   - Language preferences
   - Engagement history

---

## Conclusion

The Campaign Messaging and Activity Notification system provides HakiArdhi with:

✅ **Professional Communication** - Multi-channel delivery via Bird API
✅ **Intelligent Routing** - WhatsApp > SMS fallback for reliability
✅ **Comprehensive Tracking** - Full audit trail in message_jobs table
✅ **Scalable Architecture** - Batch processing for thousands of recipients
✅ **Admin Control** - Manual campaign triggers from admin portal
✅ **Cost Optimization** - Smart channel selection reduces SMS costs

### Next Steps

1. Set up Bird account and configure channels
2. Deploy code to staging environment
3. Test with small recipient groups
4. Train admin staff on campaign interface
5. Monitor first campaigns closely
6. Gather feedback and optimize

---

**Implementation Date:** November 29, 2025
**Implemented By:** Claude Code
**Status:** ✅ Ready for Testing
