# Hybrid Chat System - Setup Complete

## Overview
Your website now has a fully functional hybrid chatbot system that intelligently switches between AI (Gemini) and human admin responses based on admin availability.

## How It Works

### For Visitors/Users:
1. Click the "Chat with us" button on any page
2. If not logged in, provide name and email
3. Start chatting - messages are sent to the system
4. Receive responses:
   - **Admin Online**: Admin responds within 1 minute
   - **Admin Offline**: AI (Gemini) responds automatically with business information

### For Admins:
1. Navigate to **Dashboard → Chats** in the sidebar
2. Toggle your status **Online/Offline** using the button
3. When online:
   - New conversations are automatically assigned to you
   - You have 1 minute to respond before AI takes over
   - Conversations update in real-time
4. When offline:
   - AI automatically handles all conversations
   - You can still view conversation history

## Features

### User Experience:
- ✅ Real-time messaging
- ✅ Guest chat (no login required)
- ✅ Quick reply buttons for common questions
- ✅ Visual indicators for admin/AI responses
- ✅ Message status indicators
- ✅ Responsive design (mobile & desktop)

### Admin Features:
- ✅ Unified chat dashboard
- ✅ Online/Offline status toggle
- ✅ Real-time conversation list
- ✅ Unread message counter
- ✅ Search conversations
- ✅ Auto-refresh (polls every 3 seconds)
- ✅ Heartbeat system (keeps you online)

### AI Features:
- ✅ Powered by Google Gemini Pro
- ✅ Business-aware responses about:
  - Educational services
  - Study abroad programs (Stipendium Hungaricum)
  - Travel & Tours
  - Visa assistance
  - Hotel & flight bookings
- ✅ Context-aware (remembers last 5 messages)
- ✅ Fallback responses when uncertain

## Database Models

### ChatConversation
- Stores conversation metadata
- Tracks assigned admin
- Records admin online status
- Manages conversation status

### ChatMessage
- Individual messages
- Sender type (USER, ADMIN, AI)
- Read status
- Metadata (AI confidence, etc.)

### AdminChatStatus
- Admin online/offline status
- Last active timestamp
- Auto-respond settings

## API Endpoints

### `/api/chat/conversations` (GET, POST)
- GET: Fetch all conversations (admin) or user's conversations
- POST: Create new conversation

### `/api/chat/messages` (GET, POST, PATCH)
- GET: Fetch messages for a conversation
- POST: Send a message (with AI fallback)
- PATCH: Mark messages as read

### `/api/chat/admin/status` (GET, POST, PATCH)
- GET: Get admin online status
- POST: Update admin online/offline status
- PATCH: Heartbeat to maintain online status

## Configuration

### Environment Variables
```env
GEMINI_API_KEY=AIzaSyAsSiK-jtgY4YTq7AKH-sP-ejuQw2DFo64
```

### Admin Response Time
- Default: 60 seconds (1 minute)
- Can be adjusted in `/api/chat/messages/route.ts`
- Change the value in `Date.now() - 60000`

### Poll Intervals
- Conversation list: 3 seconds
- Messages: 3 seconds  
- Admin heartbeat: 30 seconds

## File Structure

```
app/
├── api/
│   └── chat/
│       ├── conversations/route.ts      # Conversation management
│       ├── messages/route.ts           # Message handling + AI
│       └── admin/
│           └── status/route.ts         # Admin status management
├── components/
│   ├── ChatButton.tsx                  # Old chatbot (keep for reference)
│   └── HybridChatButton.tsx           # New hybrid chatbot
└── profile/
    └── chats/
        └── page.tsx                    # Admin chat dashboard

prisma/
└── schema.prisma                       # Added chat models
```

## Usage Instructions

### For Regular Users:
1. Chat button appears on all pages
2. Click to start chatting
3. Either admin or AI will respond

### For Admins:
1. Login to admin account
2. Go to "Chats" in sidebar
3. Click "Online" button to go online
4. Select conversations to respond
5. Type and send messages
6. Click "Offline" when done

## AI Training

The AI is trained with context about your business:
- Services offered
- Contact information
- Program details (Stipendium Hungaricum)
- Operating hours

To update AI knowledge, edit the `businessContext` in:
`app/api/chat/messages/route.ts`

## Customization

### Change AI Model:
```typescript
// In app/api/chat/messages/route.ts
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
// Change to: 'gemini-pro-vision' for images, etc.
```

### Change Response Timeout:
```typescript
// In app/api/chat/admin/status/route.ts
lastActiveAt: {
  gte: new Date(Date.now() - 60000), // Change 60000 (1 min)
}
```

### Styling:
- Edit `app/components/HybridChatButton.tsx` for user chat
- Edit `app/profile/chats/page.tsx` for admin dashboard

## Testing

1. **Test User Chat**:
   - Open site in incognito
   - Click chat button
   - Enter name/email
   - Send message
   - Verify AI response

2. **Test Admin Chat**:
   - Login as admin
   - Go to Chats page
   - Toggle online
   - Open second browser
   - Chat as user
   - Respond as admin

3. **Test AI Fallback**:
   - Toggle admin offline
   - Send user message
   - Verify AI responds

## Troubleshooting

### AI Not Responding:
- Check GEMINI_API_KEY in .env.local
- Verify key is valid at https://makersuite.google.com/app/apikey
- Check API logs in console

### Admin Not Seeing Messages:
- Ensure admin is online
- Check heartbeat is running (every 30s)
- Verify conversation assignment

### Database Errors:
- Run `npx prisma db push` to sync schema
- Check Supabase connection

## Next Steps (Optional Enhancements)

1. **Typing Indicators**: Show when admin/AI is typing
2. **File Uploads**: Allow users to send images/documents
3. **Chat History Export**: Download conversations as PDF
4. **Canned Responses**: Quick reply templates for admins
5. **Analytics Dashboard**: Track response times, satisfaction
6. **Email Notifications**: Notify admins of new messages
7. **Multi-Admin Support**: Round-robin assignment
8. **Chat Ratings**: Let users rate conversations

## Support

For issues or questions:
- Check browser console for errors
- Review API endpoint logs
- Verify database connection
- Test Gemini API key

---

**Status**: ✅ Fully Functional
**Last Updated**: 2025-12-29
