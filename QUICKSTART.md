# Quick Start Guide

Get your omnichannel backend running in 10 minutes!

## ⚡ Fast Track Setup

### 1. Install Dependencies (2 min)

```bash
npm install
```

### 2. Configure Environment Variables (5 min)

Copy the example file:
```bash
cp .env.example .env.local
```

**Minimum Required Variables:**
```bash
# Firebase (from Firebase Console > Project Settings > Service Accounts)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Cloudinary (from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Meta (from Meta Business Manager)
META_ACCESS_TOKEN=EAAxxxxxxxxxxxx

# WhatsApp (from WhatsApp API Setup)
WHATSAPP_PHONE_NUMBER_ID=123456789

# Instagram (from Instagram Settings)
INSTAGRAM_ACCOUNT_ID=123456789

# Webhook Security
META_WEBHOOK_VERIFY_TOKEN=your-random-32-char-token
```

### 3. Start Development Server (1 min)

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

### 4. Test Webhook Verification (1 min)

```bash
curl "http://localhost:3000/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"
```

Should return: `test123`

### 5. Send Your First Message (1 min)

**WhatsApp:**
```bash
curl -X POST http://localhost:3000/api/send/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "type": "text",
    "text": "Hello from my backend!"
  }'
```

**Instagram:**
```bash
curl -X POST http://localhost:3000/api/send/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "to": "instagram-scoped-id",
    "type": "text",
    "text": "Hello from Instagram!"
  }'
```

## 🎯 Common Use Cases

### Use Case 1: Send Interactive Buttons (WhatsApp)

```javascript
const response = await fetch('http://localhost:3000/api/send/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '1234567890',
    type: 'interactive_buttons',
    text: 'How can we help you today?',
    buttons: [
      { id: 'sales', title: 'Sales' },
      { id: 'support', title: 'Support' },
      { id: 'billing', title: 'Billing' }
    ]
  })
});
```

### Use Case 2: Send Template Message

```javascript
const response = await fetch('http://localhost:3000/api/send/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '1234567890',
    type: 'template',
    template: {
      name: 'welcome_message',
      language: 'en',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: 'John Doe' }
          ]
        }
      ]
    }
  })
});
```

### Use Case 3: Send Media Message

```javascript
const response = await fetch('http://localhost:3000/api/send/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '1234567890',
    type: 'media',
    media: {
      url: 'https://example.com/product.jpg',
      type: 'image',
      caption: 'Check out our new product!'
    }
  })
});
```

### Use Case 4: Receive Webhook Events

Your webhook will automatically:
1. ✅ Receive incoming messages
2. ✅ Detect platform (WhatsApp/Instagram)
3. ✅ Parse message content
4. ✅ Download & upload media to Cloudinary
5. ✅ Save to Firestore
6. ✅ Handle deduplication

Access saved messages:
```javascript
import { getConversationMessages } from '@/lib/firebase-admin';

const messages = await getConversationMessages('1234567890', 50);
```

## 📚 Next Steps

### Connect to Frontend

**Example React Hook:**
```javascript
// hooks/useMessages.js
import { useState, useEffect } from 'react';

export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Subscribe to Firestore real-time updates
    const unsubscribe = firestore
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(msgs);
      });
    
    return unsubscribe;
  }, [conversationId]);
  
  return messages;
}
```

**Send Message Function:**
```javascript
// utils/sendMessage.js
export async function sendMessage(platform, to, text) {
  const endpoint = platform === 'whatsapp' 
    ? '/api/send/whatsapp' 
    : '/api/send/instagram';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      type: 'text',
      text
    })
  });
  
  return response.json();
}
```

### Add Auto-Reply Bot

Edit `app/api/webhook/route.js`:

```javascript
async function handleAutoReply(conversationId, messageData, platform) {
  const text = messageData.text?.toLowerCase();
  
  if (!text) return;
  
  // Keyword matching
  if (text.includes('hours') || text.includes('timing')) {
    await sendReply(conversationId, platform, 
      "We're open Mon-Fri, 9 AM - 6 PM EST");
  }
  else if (text.includes('price') || text.includes('cost')) {
    await sendReply(conversationId, platform,
      "Our pricing starts at $99/month. Would you like to see our plans?");
  }
  else if (text.includes('hello') || text.includes('hi')) {
    await sendReply(conversationId, platform,
      "👋 Hello! How can I help you today?");
  }
}

async function sendReply(to, platform, text) {
  const { sendWhatsAppText, sendInstagramText } = await import('@/lib/meta-api');
  
  if (platform === 'whatsapp') {
    await sendWhatsAppText(to, text);
  } else {
    await sendInstagramText(to, text);
  }
}
```

### Set Up Ngrok for Local Testing

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update Meta webhook URL to: https://abc123.ngrok.io/api/webhook
```

## 🐛 Troubleshooting

### Issue: Webhook not receiving events

**Solution:**
1. Check webhook URL is HTTPS (use ngrok for local)
2. Verify token matches in Meta Dashboard
3. Check webhook subscriptions are active
4. Verify app is not in test mode

### Issue: Messages not sending

**Solution:**
1. Check Meta access token is valid
2. Verify phone number format (no + or spaces)
3. Check you're not rate limited
4. View Meta API error in console logs

### Issue: Media upload fails

**Solution:**
1. Check Cloudinary credentials
2. Verify media URL is accessible
3. Check file size < 16MB
4. View detailed error in logs

### Issue: Firestore save fails

**Solution:**
1. Check Firebase credentials
2. Verify Firestore is enabled in Firebase Console
3. Check service account has proper permissions

## 📖 Documentation

- **Full README:** `README.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **API Reference:** Check code comments in `lib/meta-api.js`

## 🆘 Getting Help

1. Check console logs for detailed errors
2. Review Meta Developer documentation
3. Test with Meta Graph API Explorer
4. Check Firebase Console for Firestore issues

---

**Ready to build?** Start with the examples above and customize for your use case!
