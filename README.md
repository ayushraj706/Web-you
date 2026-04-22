# Omnichannel Social Inbox Backend

Enterprise-grade backend for building an omnichannel social inbox platform like Wati.io or Interakt. Supports WhatsApp Business API and Instagram Messaging API with complete webhook handling, media processing, and message sending capabilities.

## 🚀 Features

### ✅ Complete WhatsApp Business API Integration
- ✨ Text messages
- 🔘 Interactive buttons (up to 3 buttons)
- 📋 Interactive lists with sections
- 📄 Template messages (approved templates)
- 📸 Media messages (image, video, audio, document)
- ✓ Message read receipts
- 🔄 Webhook event handling
- 📱 Status updates (sent, delivered, read, failed)

### ✅ Complete Instagram Messaging API Integration
- ✨ Text messages
- ⚡ Quick replies (up to 13 options)
- 📸 Media messages (image, video, audio, file)
- 📖 Story replies
- 🔄 Webhook event handling
- 📬 Postback events

### ✅ Advanced Webhook Processing
- 🎯 Platform auto-detection (WhatsApp vs Instagram)
- 🔄 Duplicate event detection & deduplication
- 📦 Comprehensive payload parsing
- 🖼️ Automatic media download & upload to Cloudinary
- 💾 Firestore integration with conversations & messages
- 🚀 Asynchronous processing

### ✅ Media Handling
- 📥 Download media from Meta CDN
- ☁️ Upload to Cloudinary with optimization
- 🔒 Secure URL generation
- 📊 Metadata extraction (size, format, dimensions)

### ✅ Production-Ready Architecture
- 🛡️ Enterprise error handling with try-catch blocks
- 📝 Comprehensive logging
- 🔐 Environment variable management
- 🏗️ Modular code structure
- 📚 Full TypeScript support (optional)

## 📁 Project Structure

```
omnichannel-backend/
├── app/
│   └── api/
│       ├── webhook/
│       │   └── route.js           # Main webhook handler (GET/POST)
│       └── send/
│           ├── whatsapp/
│           │   └── route.js       # WhatsApp sending API
│           └── instagram/
│               └── route.js       # Instagram sending API
├── lib/
│   ├── firebase-admin.js          # Firebase Admin SDK setup
│   ├── cloudinary.js              # Cloudinary media handling
│   ├── meta-api.js                # Meta Graph API functions
│   └── webhook-parser.js          # Webhook payload parser
├── .env.example                   # Environment variables template
├── package.json
└── README.md
```

## 🔧 Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Cloudinary account
- Meta Business Manager account
- WhatsApp Business API access
- Instagram Business/Creator account

### 1. Clone and Install

```bash
# Create project directory
mkdir omnichannel-backend
cd omnichannel-backend

# Initialize Next.js project
npx create-next-app@latest . --app --no-tailwind --no-typescript

# Install dependencies
npm install firebase-admin cloudinary
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all required environment variables:

#### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project > Project Settings > Service Accounts
3. Click "Generate new private key"
4. Copy the entire JSON and paste into `FIREBASE_SERVICE_ACCOUNT_KEY`

#### Cloudinary Configuration
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy Cloud Name, API Key, and API Secret
3. Add to `.env.local`

#### Meta Access Token
1. Go to [Meta Business Manager](https://business.facebook.com)
2. Navigate to System Users > Generate New Token
3. Select your app and grant permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
   - `instagram_basic`
   - `instagram_manage_messages`
   - `pages_messaging`
4. Generate a **permanent token** (never expires)
5. Add to `META_ACCESS_TOKEN`

#### WhatsApp Configuration
1. In Meta Business Manager > WhatsApp > API Setup
2. Copy Phone Number ID and Business Account ID
3. Add to `.env.local`

#### Instagram Configuration
1. In Meta Business Manager > Instagram > Settings
2. Copy Account ID and Page ID
3. Add to `.env.local`

#### Webhook Verify Token
Generate a secure random token:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `META_WEBHOOK_VERIFY_TOKEN`

### 3. Configure Meta Webhook

1. Go to Meta App Dashboard > Webhooks
2. Set callback URL: `https://yourdomain.com/api/webhook`
3. Set verify token (same as `META_WEBHOOK_VERIFY_TOKEN`)
4. Subscribe to webhook fields:
   - For WhatsApp: `messages`
   - For Instagram: `messages`, `messaging_postbacks`

### 4. Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

## 📡 API Endpoints

### Webhook Endpoint

#### `GET /api/webhook`
Meta webhook verification

**Query Parameters:**
- `hub.mode` - Should be "subscribe"
- `hub.verify_token` - Your verification token
- `hub.challenge` - Challenge string to echo back

**Response:** Returns challenge string if verification succeeds

#### `POST /api/webhook`
Receive incoming webhook events

**Features:**
- Auto-detects platform (WhatsApp/Instagram)
- Parses all message types
- Downloads and uploads media to Cloudinary
- Saves to Firestore
- Handles deduplication

### Sending Messages

#### `POST /api/send/whatsapp`
Send WhatsApp messages

**Example: Text Message**
```json
{
  "to": "1234567890",
  "type": "text",
  "text": "Hello from the API!"
}
```

**Example: Interactive Buttons**
```json
{
  "to": "1234567890",
  "type": "interactive_buttons",
  "text": "Choose an option:",
  "buttons": [
    { "id": "btn_1", "title": "Option 1" },
    { "id": "btn_2", "title": "Option 2" }
  ]
}
```

**Example: Interactive List**
```json
{
  "to": "1234567890",
  "type": "interactive_list",
  "text": "Select a product:",
  "buttonText": "View Products",
  "sections": [
    {
      "title": "Category 1",
      "rows": [
        { "id": "prod_1", "title": "Product 1", "description": "Description" }
      ]
    }
  ]
}
```

**Example: Template Message**
```json
{
  "to": "1234567890",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": "en_US",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John" }
        ]
      }
    ]
  }
}
```

**Example: Media Message**
```json
{
  "to": "1234567890",
  "type": "media",
  "media": {
    "url": "https://example.com/image.jpg",
    "type": "image",
    "caption": "Check this out!"
  }
}
```

#### `POST /api/send/instagram`
Send Instagram messages

**Example: Text Message**
```json
{
  "to": "1234567890",
  "type": "text",
  "text": "Hello from Instagram!"
}
```

**Example: Quick Replies**
```json
{
  "to": "1234567890",
  "type": "quick_replies",
  "text": "Choose an option:",
  "quickReplies": [
    { "content_type": "text", "title": "Option 1", "payload": "opt_1" },
    { "content_type": "text", "title": "Option 2", "payload": "opt_2" }
  ]
}
```

## 🔥 Firestore Structure

### Collections

```
conversations/
  {conversationId}/              # Phone number or Instagram ID
    - platform: string
    - lastMessageAt: timestamp
    - lastMessageText: string
    - unreadCount: number
    - createdAt: timestamp
    - updatedAt: timestamp
    
    messages/                    # Subcollection
      {messageId}/
        - messageId: string
        - senderId: string
        - recipientId: string
        - timestamp: number
        - type: string
        - text: string
        - media: object
        - direction: string      # incoming/outgoing
        - status: string         # received/sent/delivered/read
        - createdAt: timestamp

webhook_events/                  # Deduplication tracking
  {eventId}/
    - eventId: string
    - processedAt: timestamp
    - expiresAt: timestamp
```

## 🧪 Testing

### Test Webhook Verification

```bash
curl "http://localhost:3000/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"
```

### Test WhatsApp Text Message

```bash
curl -X POST http://localhost:3000/api/send/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "type": "text",
    "text": "Hello from the API!"
  }'
```

### Test Instagram Message

```bash
curl -X POST http://localhost:3000/api/send/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "to": "INSTAGRAM_SCOPED_ID",
    "type": "text",
    "text": "Hello from Instagram!"
  }'
```

## 🛡️ Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use HTTPS in production** - Required by Meta
3. **Validate webhook signatures** - Implement in production
4. **Rate limiting** - Add middleware to prevent abuse
5. **Input validation** - Validate all user inputs
6. **Error handling** - Never expose sensitive errors to clients

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in Vercel Dashboard > Settings > Environment Variables

### Other Platforms
- Railway
- Render
- AWS Lambda
- Google Cloud Run
- Azure Functions

## 📚 Additional Resources

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Instagram Messaging API Docs](https://developers.facebook.com/docs/messenger-platform)
- [Meta Graph API Reference](https://developers.facebook.com/docs/graph-api)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Cloudinary API Docs](https://cloudinary.com/documentation)

## 🤝 Support

For issues or questions:
1. Check the [Meta Developer Community](https://developers.facebook.com/community/)
2. Review [Next.js Documentation](https://nextjs.org/docs)
3. Check Firebase and Cloudinary docs

## 📄 License

MIT License - feel free to use in your projects!

---

**Built with ❤️ for enterprise omnichannel messaging**
