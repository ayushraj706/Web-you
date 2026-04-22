/**
 * Instagram Messaging API Routes
 * 
 * @route /api/send/instagram
 */

import { NextResponse } from 'next/server';
import {
  sendInstagramText,
  sendInstagramQuickReplies,
  sendInstagramMedia,
} from '@/lib/meta-api';
import { saveMessageToFirestore } from '@/lib/firebase-admin';

/**
 * POST /api/send/instagram
 * 
 * Send Instagram messages of various types
 * 
 * Body parameters:
 * - to: Recipient Instagram-scoped ID (required)
 * - type: Message type (text, quick_replies, media)
 * - text: Message text (for text messages)
 * - quickReplies: Array of quick reply objects
 * - media: Media configuration
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const { to, type, text, quickReplies, media } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Recipient Instagram ID is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Message type is required' },
        { status: 400 }
      );
    }

    let result;
    let messageData;

    // Send message based on type
    switch (type) {
      case 'text':
        if (!text) {
          return NextResponse.json(
            { error: 'Message text is required for text messages' },
            { status: 400 }
          );
        }
        
        result = await sendInstagramText(to, text);
        
        messageData = {
          messageId: result.messageId,
          senderId: process.env.INSTAGRAM_ACCOUNT_ID,
          recipientId: to,
          timestamp: Date.now(),
          type: 'text',
          text,
          direction: 'outgoing',
          status: 'sent',
          platform: 'instagram',
        };
        break;

      case 'quick_replies':
        if (!text || !quickReplies) {
          return NextResponse.json(
            { error: 'Text and quick replies are required' },
            { status: 400 }
          );
        }
        
        result = await sendInstagramQuickReplies(to, text, quickReplies);
        
        messageData = {
          messageId: result.messageId,
          senderId: process.env.INSTAGRAM_ACCOUNT_ID,
          recipientId: to,
          timestamp: Date.now(),
          type: 'text',
          text,
          quickReplies,
          direction: 'outgoing',
          status: 'sent',
          platform: 'instagram',
        };
        break;

      case 'media':
        if (!media || !media.url || !media.type) {
          return NextResponse.json(
            { error: 'Media URL and type are required' },
            { status: 400 }
          );
        }
        
        result = await sendInstagramMedia(to, media.url, media.type);
        
        messageData = {
          messageId: result.messageId,
          senderId: process.env.INSTAGRAM_ACCOUNT_ID,
          recipientId: to,
          timestamp: Date.now(),
          type: media.type,
          media: {
            url: media.url,
            type: media.type,
          },
          direction: 'outgoing',
          status: 'sent',
          platform: 'instagram',
        };
        break;

      default:
        return NextResponse.json(
          { error: `Invalid message type: ${type}` },
          { status: 400 }
        );
    }

    // Save to Firestore
    await saveMessageToFirestore(to, messageData, 'instagram');

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Instagram send error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/send/instagram
 * 
 * Get API documentation
 */
export async function GET(request) {
  return NextResponse.json({
    endpoint: '/api/send/instagram',
    method: 'POST',
    description: 'Send Instagram messages',
    supportedTypes: [
      'text',
      'quick_replies',
      'media',
    ],
    examples: {
      text: {
        to: '1234567890',
        type: 'text',
        text: 'Hello from Instagram!',
      },
      quick_replies: {
        to: '1234567890',
        type: 'quick_replies',
        text: 'Choose an option:',
        quickReplies: [
          { content_type: 'text', title: 'Option 1', payload: 'opt_1' },
          { content_type: 'text', title: 'Option 2', payload: 'opt_2' },
        ],
      },
      media: {
        to: '1234567890',
        type: 'media',
        media: {
          url: 'https://example.com/image.jpg',
          type: 'image',
        },
      },
    },
  });
}
