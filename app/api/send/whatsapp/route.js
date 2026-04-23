/**
 * WhatsApp Messaging API Routes
 * 
 * @route /api/send/whatsapp
 */

import { NextResponse } from 'next/server';
import {
  sendWhatsAppText,
  sendWhatsAppInteractiveButtons,
  sendWhatsAppInteractiveList,
  sendWhatsAppTemplate,
  sendWhatsAppMedia,
} from '@/lib/meta-api';
import { saveMessageToFirestore } from '@/lib/firebase-admin';

/**
 * POST /api/send/whatsapp
 * 
 * Send WhatsApp messages of various types
 * 
 * Body parameters:
 * - to: Recipient phone number (required)
 * - type: Message type (text, interactive_buttons, interactive_list, template, media)
 * - text: Message text (for text messages)
 * - buttons: Array of buttons (for interactive_buttons)
 * - sections: Array of sections (for interactive_list)
 * - template: Template configuration (for template messages)
 * - media: Media configuration (for media messages)
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const { to, type, text, buttons, sections, template, media, ...options } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Recipient phone number is required' },
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
        
        result = await sendWhatsAppText(to, text, options.previewUrl);
        
        messageData = {
          messageId: result.messageId,
          senderId: process.env.WHATSAPP_PHONE_NUMBER_ID,
          recipientId: to,
          timestamp: Date.now(),
          type: 'text',
          text,
          direction: 'outgoing',
          status: 'sent',
          platform: 'whatsapp',
        };
        break;

      case 'interactive_buttons':
        if (!text || !buttons) {
          return NextResponse.json(
            { error: 'Text and buttons are required for interactive button messages' },
            { status: 400 }
          );
        }
        
        result = await sendWhatsAppInteractiveButtons(
          to,
          text,
          buttons,
          options.headerText,
          options.footerText
        );
        
        messageData = {
          messageId: result.messageId,
          senderId: process.env.WHATSAPP_PHONE_NUMBER_ID,
          recipientId: to,
          timestamp: Date.now(),
          type: 'interactive',
          text,
          interactive: {
            type: 'button',
            buttons,
          },
          direction: 'outgoing',
          status: 'sent',
          platform: 'whatsapp',
        };
        break;

      case 'interactive_list':
        if (!text || !sections || !options.buttonText) {
          return NextResponse.json(
            { error: 'Text, sections, and button text are required for interactive list messages' },
            { status: 400 }
          );
        }
        
        result = await sendWhatsAppInteractiveList(
          to,
          text,
          options.buttonText,
          sections,
          options.headerText,
          options.footerText
        );
        
        messageData = {
          messageId: result.messageId,
          senderId: process.env.WHATSAPP_PHONE_NUMBER_ID,
          recipientId: to,
          timestamp: Date.now(),
          type: 'interactive',
          text,
          interactive: {
            type: 'list',
            sections,
            buttonText: options.buttonText,
          },
          direction: 'outgoing',
          status: 'sent',
          platform: 'whatsapp',
        };
        break;

      case 'template':
        if (!template || !template.name || !template.language) {
          return NextResponse.json(
            { error: 'Template name and language are required for template messages' },
            { status: 400 }
          );
        }
        
        result = await sendWhatsAppTemplate(
          to,
          template.name,
          template.language,
          template.components || []
        );
        
        messageData = {
          messageId: result.messageId,
          senderId: process.env.WHATSAPP_PHONE_NUMBER_ID,
          recipientId: to,
          timestamp: Date.now(),
          type: 'template',
          template: {
            name: template.name,
            language: template.language,
            components: template.components,
          },
          direction: 'outgoing',
          status: 'sent',
          platform: 'whatsapp',
        };
        break;

      case 'media':
        if (!media || !media.url || !media.type) {
          return NextResponse.json(
            { error: 'Media URL and type are required for media messages' },
            { status: 400 }
          );
        }
        
        result = await sendWhatsAppMedia(
          to,
          media.url,
          media.type,
          media.caption,
          media.filename
        );
        
        messageData = {
          messageId: result.messageId,
          senderId: process.env.WHATSAPP_PHONE_NUMBER_ID,
          recipientId: to,
          timestamp: Date.now(),
          type: media.type,
          media: {
            url: media.url,
            type: media.type,
            caption: media.caption,
            filename: media.filename,
          },
          direction: 'outgoing',
          status: 'sent',
          platform: 'whatsapp',
        };
        break;

      default:
        return NextResponse.json(
          { error: `Invalid message type: ${type}` },
          { status: 400 }
        );
    }

    // Save to Firestore
    await saveMessageToFirestore(to, messageData, 'whatsapp');

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    
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
 * GET /api/send/whatsapp
 * 
 * Get API documentation
 */
export async function GET(request) {
  return NextResponse.json({
    endpoint: '/api/send/whatsapp',
    method: 'POST',
    description: 'Send WhatsApp messages',
    supportedTypes: [
      'text',
      'interactive_buttons',
      'interactive_list',
      'template',
      'media',
    ],
    examples: {
      text: {
        to: '1234567890',
        type: 'text',
        text: 'Hello from the API!',
      },
      interactive_buttons: {
        to: '1234567890',
        type: 'interactive_buttons',
        text: 'Choose an option:',
        buttons: [
          { id: 'btn_1', title: 'Option 1' },
          { id: 'btn_2', title: 'Option 2' },
        ],
      },
      interactive_list: {
        to: '1234567890',
        type: 'interactive_list',
        text: 'Select a product:',
        buttonText: 'View Products',
        sections: [
          {
            title: 'Category 1',
            rows: [
              { id: 'prod_1', title: 'Product 1', description: 'Description 1' },
              { id: 'prod_2', title: 'Product 2', description: 'Description 2' },
            ],
          },
        ],
      },
      template: {
        to: '1234567890',
        type: 'template',
        template: {
          name: 'hello_world',
          language: 'en_US',
          components: [],
        },
      },
      media: {
        to: '1234567890',
        type: 'media',
        media: {
          url: 'https://example.com/image.jpg',
          type: 'image',
          caption: 'Check this out!',
        },
      },
    },
  });
}
