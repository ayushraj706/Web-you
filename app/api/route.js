/**
 * Meta Webhook Handler (Next.js App Router)
 * 
 * Handles webhook verification (GET) and incoming events (POST)
 * Supports both WhatsApp Business API and Instagram Messaging API
 * 
 * @route /api/webhook
 */

import { NextResponse } from 'next/server';
import { 
  parseWebhook, 
  processMessageMedia, 
  generateEventId 
} from '@/lib/webhook-parser';
import { 
  saveMessageToFirestore, 
  isWebhookEventProcessed 
} from '@/lib/firebase-admin';

/**
 * GET - Webhook Verification
 * 
 * Meta will send a GET request to verify the webhook endpoint
 * Must respond with the challenge value if verify_token matches
 * 
 * Query parameters:
 * - hub.mode: Should be 'subscribe'
 * - hub.verify_token: Your verification token
 * - hub.challenge: Random string to echo back
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('🔐 Webhook verification request received');
    console.log({
      mode,
      token: token ? '***' + token.slice(-4) : 'missing',
      challenge: challenge ? challenge.substring(0, 20) + '...' : 'missing',
    });

    // Check required parameters
    if (!mode || !token) {
      console.error('❌ Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify mode is 'subscribe'
    if (mode !== 'subscribe') {
      console.error(`❌ Invalid mode: ${mode}`);
      return NextResponse.json(
        { error: 'Invalid mode' },
        { status: 403 }
      );
    }

    // Verify token matches
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
    
    if (!verifyToken) {
      console.error('❌ META_WEBHOOK_VERIFY_TOKEN not configured');
      return NextResponse.json(
        { error: 'Webhook verification token not configured' },
        { status: 500 }
      );
    }

    if (token !== verifyToken) {
      console.error('❌ Verification token mismatch');
      return NextResponse.json(
        { error: 'Verification token mismatch' },
        { status: 403 }
      );
    }

    // Verification successful - return challenge
    console.log('✅ Webhook verified successfully');
    
    // Return challenge as plain text (Meta expects this)
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('❌ Webhook verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Webhook Event Handler
 * 
 * Receives and processes incoming webhook events from Meta
 * Handles WhatsApp and Instagram messages, media, interactive replies
 */
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const payload = await request.json();

    console.log('\n📨 ===== INCOMING WEBHOOK =====');
    console.log('Object:', payload.object);
    console.log('Entry count:', payload.entry?.length || 0);

    // Log full payload in debug mode
    if (process.env.DEBUG_MODE === 'true') {
      console.log('Full payload:', JSON.stringify(payload, null, 2));
    }

    // Parse webhook to extract platform and messages
    const { platform, messages } = await parseWebhook(payload);

    console.log(`🔍 Platform: ${platform.toUpperCase()}`);
    console.log(`📬 Messages to process: ${messages.length}`);

    // Process each message
    const results = [];
    
    for (const message of messages) {
      try {
        console.log(`\n--- Processing ${message.eventType} event ---`);
        console.log(`Message ID: ${message.messageId || 'N/A'}`);
        console.log(`Type: ${message.type || 'N/A'}`);
        console.log(`Sender: ${message.senderId || 'N/A'}`);

        // Generate unique event ID for deduplication
        const eventId = generateEventId(message);
        
        // Check if event was already processed
        const isDuplicate = await isWebhookEventProcessed(eventId);
        
        if (isDuplicate) {
          console.log(`⏭️ Skipping duplicate event: ${eventId}`);
          results.push({
            messageId: message.messageId,
            status: 'skipped',
            reason: 'duplicate',
          });
          continue;
        }

        // Skip status updates and non-message events for now
        // You can customize this to handle delivery receipts, read receipts, etc.
        if (message.eventType !== 'message') {
          console.log(`ℹ️ Skipping ${message.eventType} event`);
          results.push({
            messageId: message.messageId,
            eventType: message.eventType,
            status: 'skipped',
            reason: 'non-message-event',
          });
          continue;
        }

        // Skip echo messages (messages sent by our own page/business)
        if (message.isEcho) {
          console.log('🔁 Skipping echo message');
          results.push({
            messageId: message.messageId,
            status: 'skipped',
            reason: 'echo',
          });
          continue;
        }

        // Process media if present
        if (message.media && message.media.id) {
          console.log(`📸 Processing media: ${message.media.id}`);
          await processMessageMedia(message);
        }

        // Prepare message data for Firestore
        const messageData = {
          messageId: message.messageId,
          senderId: message.senderId,
          recipientId: message.recipientId,
          timestamp: message.timestamp,
          type: message.type,
          text: message.text || null,
          media: message.media || null,
          interactive: message.interactive || null,
          quickReply: message.quickReply || null,
          location: message.location || null,
          contacts: message.contacts || null,
          reaction: message.reaction || null,
          replyTo: message.replyTo || null,
          context: message.context || null,
          referral: message.referral || null,
          senderName: message.senderName || null,
          direction: 'incoming',
          status: 'received',
          platform: message.platform,
        };

        // Determine conversation ID (phone number for WhatsApp, IGSID for Instagram)
        let conversationId;
        
        if (platform === 'whatsapp') {
          conversationId = message.senderId; // Phone number
        } else if (platform === 'instagram') {
          conversationId = message.senderId; // Instagram-scoped ID
        }

        // Save to Firestore
        console.log(`💾 Saving to Firestore (conversation: ${conversationId})`);
        
        const saveResult = await saveMessageToFirestore(
          conversationId,
          messageData,
          platform
        );

        console.log(`✅ Message saved: ${saveResult.messageId}`);

        results.push({
          messageId: message.messageId,
          conversationId,
          firestoreMessageId: saveResult.messageId,
          status: 'processed',
        });

        // Optional: Forward webhook to another service (analytics, CRM, etc.)
        if (process.env.FORWARD_WEBHOOK_ENABLED === 'true' && process.env.FORWARD_WEBHOOK_URL) {
          try {
            await fetch(process.env.FORWARD_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                platform,
                message: messageData,
                timestamp: new Date().toISOString(),
              }),
            });
            console.log('📤 Webhook forwarded to external service');
          } catch (forwardError) {
            console.error('⚠️ Failed to forward webhook:', forwardError.message);
            // Don't fail the main webhook processing
          }
        }

        // Optional: Trigger auto-reply or bot logic here
        // await handleAutoReply(conversationId, messageData, platform);

      } catch (messageError) {
        console.error(`❌ Error processing message ${message.messageId}:`, messageError);
        
        results.push({
          messageId: message.messageId,
          status: 'error',
          error: messageError.message,
        });
        
        // Continue processing other messages
      }
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`\n✅ ===== WEBHOOK PROCESSING COMPLETE =====`);
    console.log(`Processed: ${results.filter(r => r.status === 'processed').length}`);
    console.log(`Skipped: ${results.filter(r => r.status === 'skipped').length}`);
    console.log(`Errors: ${results.filter(r => r.status === 'error').length}`);
    console.log(`Processing time: ${processingTime}ms`);
    console.log('===========================================\n');

    // Return 200 OK to Meta (required to acknowledge receipt)
    return NextResponse.json(
      {
        success: true,
        platform,
        processed: results.filter(r => r.status === 'processed').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        errors: results.filter(r => r.status === 'error').length,
        processingTime: `${processingTime}ms`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('\n❌ ===== WEBHOOK ERROR =====');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('============================\n');

    // Still return 200 to prevent Meta from retrying
    // Log error for internal investigation
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 200 }
    );
  }
}

/**
 * Optional: Handle auto-reply logic
 * 
 * @param {string} conversationId - Conversation identifier
 * @param {object} messageData - Incoming message data
 * @param {string} platform - Platform (whatsapp or instagram)
 */
async function handleAutoReply(conversationId, messageData, platform) {
  try {
    // Example: Simple keyword-based auto-reply
    const text = messageData.text?.toLowerCase();
    
    if (!text) return;

    // Import messaging functions
    const { sendWhatsAppText, sendInstagramText } = await import('@/lib/meta-api');

    if (text.includes('hello') || text.includes('hi')) {
      const replyText = "👋 Hello! Thanks for reaching out. How can I help you today?";
      
      if (platform === 'whatsapp') {
        await sendWhatsAppText(conversationId, replyText);
      } else if (platform === 'instagram') {
        await sendInstagramText(conversationId, replyText);
      }
      
      console.log('🤖 Auto-reply sent');
    }
  } catch (error) {
    console.error('⚠️ Auto-reply error:', error);
    // Don't throw - auto-reply failure shouldn't break webhook
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function PUT(request) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(request) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH(request) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
