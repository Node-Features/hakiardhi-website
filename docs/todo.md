 2.2 Campaign Messages
  File: Backend/v1/src/app/api/admin/campaigns/send/route.ts
  - Manual trigger from admin portal
  - Select recipients (SMS/Email/WhatsApp)
  - Use Bird batch API
  - Track via message_jobs table

  2.3 Activity Assignment Notifications
  Update: Backend/v1/src/app/api/admin/activities/[id]/assignments/route.ts
  - Replace notificationService.sendSMS() with birdService.sendMessage()
  - Use WhatsApp for instant delivery
  - SMS as fallback