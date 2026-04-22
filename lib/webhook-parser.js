/**
 * Webhook Payload Parser
 * 
 * Parses incoming webhook payloads from Meta (WhatsApp & Instagram)
 * Extracts messages, sender info, and handles all message types
 * 
 * @module lib/webhook-parser
 */

import { processAndUploadMetaMedia } from './cloudinary.js';

/**
 * Determine platform from webhook payload
 * 
 * @param {object} payload - Webhook payload
 * @returns {string|null} Platform identifier ('whatsapp' or 'instagram')
 */
export function detectPlatform(payload) {
  try {
    // Check for WhatsApp indicators
    if (payload.object === 'whatsapp_business_account') {
      return 'whatsapp';
    }

    // Check for Instagram indicators
    if (payload.object === 'instagram' || payload.object === 'page') {
      // Further check entry for Instagram messaging
      if (payload.entry?.[0]?.messaging || payload.entry?.[0]?.changes?.[0]?.field === 'messages') {
        return 'instagram';
      }
    }

    // Check messaging_product field in entry
    if (payload.entry?.[0]?.changes?.[0]?.value?.messaging_product === 'whatsapp') {
      return 'whatsapp';
    }

    console.warn('⚠️ Unable to detect platform from payload');
    return null;
  } catch (error) {
    console.error('❌ Error detecting platform:', error);
    return null;
  }
}

/**
 * Parse WhatsApp webhook payload
 * 
 * @param {object} payload - WhatsApp webhook payload
 * @returns {array} Array of parsed message objects
 */
export function parseWhatsAppWebhook(payload) {
  try {
    const messages = [];

    if (!payload.entry || payload.entry.length === 0) {
      return messages;
    }

    for (const entry of payload.entry) {
      if (!entry.changes || entry.changes.length === 0) {
        continue;
      }

      for (const change of entry.changes) {
        if (change.field !== 'messages') {
          continue;
        }

        const value = change.value;

        // Extract business phone number
        const businessPhoneNumberId = value.metadata?.phone_number_id;
        const businessDisplayPhone = value.metadata?.display_phone_number;

        // Process status updates (sent, delivered, read, failed)
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            messages.push({
              eventType: 'status',
              platform: 'whatsapp',
              messageId: status.id,
              recipientId: status.recipient_id,
              status: status.status, // sent, delivered, read, failed
              timestamp: parseInt(status.timestamp),
              conversation: status.conversation,
              pricing: status.pricing,
              errors: status.errors,
              businessPhoneNumberId,
            });
          }
        }

        // Process incoming messages
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            const parsedMessage = {
              eventType: 'message',
              platform: 'whatsapp',
              messageId: message.id,
              senderId: message.from,
              recipientId: businessPhoneNumberId,
              timestamp: parseInt(message.timestamp),
              type: message.type,
              businessPhoneNumberId,
              businessDisplayPhone,
            };

            // Extract contact info if available
            if (value.contacts && value.contacts.length > 0) {
              const contact = value.contacts.find(c => c.wa_id === message.from);
              if (contact) {
                parsedMessage.senderName = contact.profile?.name;
              }
            }

            // Parse message content based on type
            switch (message.type) {
              case 'text':
                parsedMessage.text = message.text.body;
                break;

              case 'image':
                parsedMessage.media = {
                  id: message.image.id,
                  mimeType: message.image.mime_type,
                  sha256: message.image.sha256,
                  caption: message.image.caption,
                };
                break;

              case 'video':
                parsedMessage.media = {
                  id: message.video.id,
                  mimeType: message.video.mime_type,
                  sha256: message.video.sha256,
                  caption: message.video.caption,
                };
                break;

              case 'audio':
                parsedMessage.media = {
                  id: message.audio.id,
                  mimeType: message.audio.mime_type,
                  sha256: message.audio.sha256,
                  voice: message.audio.voice || false,
                };
                break;

              case 'document':
                parsedMessage.media = {
                  id: message.document.id,
                  mimeType: message.document.mime_type,
                  sha256: message.document.sha256,
                  filename: message.document.filename,
                  caption: message.document.caption,
                };
                break;

              case 'sticker':
                parsedMessage.media = {
                  id: message.sticker.id,
                  mimeType: message.sticker.mime_type,
                  sha256: message.sticker.sha256,
                  animated: message.sticker.animated || false,
                };
                break;

              case 'location':
                parsedMessage.location = {
                  latitude: message.location.latitude,
                  longitude: message.location.longitude,
                  name: message.location.name,
                  address: message.location.address,
                };
                break;

              case 'contacts':
                parsedMessage.contacts = message.contacts;
                break;

              case 'interactive':
                // Button reply
                if (message.interactive.type === 'button_reply') {
                  parsedMessage.interactive = {
                    type: 'button_reply',
                    buttonId: message.interactive.button_reply.id,
                    buttonTitle: message.interactive.button_reply.title,
                  };
                  parsedMessage.text = message.interactive.button_reply.title;
                }
                // List reply
                else if (message.interactive.type === 'list_reply') {
                  parsedMessage.interactive = {
                    type: 'list_reply',
                    listId: message.interactive.list_reply.id,
                    listTitle: message.interactive.list_reply.title,
                    listDescription: message.interactive.list_reply.description,
                  };
                  parsedMessage.text = message.interactive.list_reply.title;
                }
                break;

              case 'button':
                parsedMessage.button = {
                  payload: message.button.payload,
                  text: message.button.text,
                };
                parsedMessage.text = message.button.text;
                break;

              case 'reaction':
                parsedMessage.reaction = {
                  messageId: message.reaction.message_id,
                  emoji: message.reaction.emoji,
                };
                break;

              case 'order':
                parsedMessage.order = message.order;
                break;

              case 'system':
                parsedMessage.system = {
                  body: message.system.body,
                  type: message.system.type,
                };
                break;

              default:
                console.warn(`⚠️ Unknown WhatsApp message type: ${message.type}`);
                parsedMessage.raw = message;
            }

            // Add context if message is a reply
            if (message.context) {
              parsedMessage.context = {
                messageId: message.context.id,
                from: message.context.from,
              };
            }

            // Add referral info if present
            if (message.referral) {
              parsedMessage.referral = message.referral;
            }

            messages.push(parsedMessage);
          }
        }
      }
    }

    return messages;
  } catch (error) {
    console.error('❌ Error parsing WhatsApp webhook:', error);
    throw error;
  }
}

/**
 * Parse Instagram webhook payload
 * 
 * @param {object} payload - Instagram webhook payload
 * @returns {array} Array of parsed message objects
 */
export function parseInstagramWebhook(payload) {
  try {
    const messages = [];

    if (!payload.entry || payload.entry.length === 0) {
      return messages;
    }

    for (const entry of payload.entry) {
      const pageId = entry.id;
      const time = entry.time;

      // Handle messaging events
      if (entry.messaging && entry.messaging.length > 0) {
        for (const event of entry.messaging) {
          const senderId = event.sender.id;
          const recipientId = event.recipient.id;
          const timestamp = event.timestamp;

          // Message event
          if (event.message) {
            const message = event.message;
            
            const parsedMessage = {
              eventType: 'message',
              platform: 'instagram',
              messageId: message.mid,
              senderId,
              recipientId,
              timestamp,
              pageId,
            };

            // Text message
            if (message.text) {
              parsedMessage.type = 'text';
              parsedMessage.text = message.text;
            }

            // Attachments (image, video, audio, file)
            if (message.attachments && message.attachments.length > 0) {
              const attachment = message.attachments[0];
              parsedMessage.type = attachment.type; // image, video, audio, file
              parsedMessage.media = {
                type: attachment.type,
                url: attachment.payload.url,
              };
            }

            // Quick reply
            if (message.quick_reply) {
              parsedMessage.quickReply = {
                payload: message.quick_reply.payload,
              };
            }

            // Reply to story
            if (message.reply_to) {
              parsedMessage.replyTo = {
                storyId: message.reply_to.story?.id,
                storyUrl: message.reply_to.story?.url,
              };
            }

            // Is echo (message sent by page)
            if (message.is_echo) {
              parsedMessage.isEcho = true;
              parsedMessage.appId = message.app_id;
            }

            messages.push(parsedMessage);
          }

          // Postback event (button click)
          if (event.postback) {
            messages.push({
              eventType: 'postback',
              platform: 'instagram',
              senderId,
              recipientId,
              timestamp,
              pageId,
              type: 'postback',
              payload: event.postback.payload,
              title: event.postback.title,
              referral: event.postback.referral,
            });
          }

          // Read event
          if (event.read) {
            messages.push({
              eventType: 'read',
              platform: 'instagram',
              senderId,
              recipientId,
              timestamp,
              pageId,
              watermark: event.read.watermark,
            });
          }

          // Delivery event
          if (event.delivery) {
            messages.push({
              eventType: 'delivery',
              platform: 'instagram',
              senderId,
              recipientId,
              timestamp,
              pageId,
              messageIds: event.delivery.mids,
              watermark: event.delivery.watermark,
            });
          }

          // Reaction event
          if (event.reaction) {
            messages.push({
              eventType: 'reaction',
              platform: 'instagram',
              senderId,
              recipientId,
              timestamp,
              pageId,
              reaction: event.reaction.reaction,
              emoji: event.reaction.emoji,
              action: event.reaction.action, // react, unreact
              messageId: event.reaction.mid,
            });
          }
        }
      }

      // Handle changes (for Instagram Graph API)
      if (entry.changes && entry.changes.length > 0) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const value = change.value;
            
            if (value.message) {
              messages.push({
                eventType: 'message',
                platform: 'instagram',
                messageId: value.message.mid,
                senderId: value.from.id,
                recipientId: value.to?.id,
                timestamp: parseInt(value.message.timestamp),
                type: 'text',
                text: value.message.text,
                pageId,
              });
            }
          }
        }
      }
    }

    return messages;
  } catch (error) {
    console.error('❌ Error parsing Instagram webhook:', error);
    throw error;
  }
}

/**
 * Universal webhook parser
 * 
 * @param {object} payload - Webhook payload
 * @returns {Promise<object>} Parsed webhook data
 */
export async function parseWebhook(payload) {
  try {
    const platform = detectPlatform(payload);

    if (!platform) {
      throw new Error('Unable to detect platform from webhook payload');
    }

    console.log(`📨 Parsing ${platform.toUpperCase()} webhook...`);

    let messages = [];

    if (platform === 'whatsapp') {
      messages = parseWhatsAppWebhook(payload);
    } else if (platform === 'instagram') {
      messages = parseInstagramWebhook(payload);
    }

    console.log(`✅ Parsed ${messages.length} events from ${platform} webhook`);

    return {
      platform,
      messages,
      rawPayload: payload,
    };
  } catch (error) {
    console.error('❌ Failed to parse webhook:', error);
    throw error;
  }
}

/**
 * Process media in message (download from Meta and upload to Cloudinary)
 * 
 * @param {object} message - Parsed message object
 * @returns {Promise<object>} Message with Cloudinary URL
 */
export async function processMessageMedia(message) {
  try {
    if (!message.media || !message.media.id) {
      return message;
    }

    console.log(`📥 Processing media for message ${message.messageId}`);

    const accessToken = process.env.META_ACCESS_TOKEN;
    
    const cloudinaryData = await processAndUploadMetaMedia(
      message.media.id,
      accessToken,
      {
        platform: message.platform,
        messageId: message.messageId,
        messageType: message.type,
      }
    );

    // Add Cloudinary URL to message
    message.media.cloudinaryUrl = cloudinaryData.cloudinaryUrl;
    message.media.cloudinaryPublicId = cloudinaryData.cloudinaryPublicId;
    message.media.originalUrl = cloudinaryData.originalUrl;
    
    // Add additional metadata
    if (!message.media.mimeType) {
      message.media.mimeType = cloudinaryData.mimeType;
    }

    console.log(`✅ Media processed: ${cloudinaryData.cloudinaryUrl}`);

    return message;
  } catch (error) {
    console.error(`❌ Failed to process media for message ${message.messageId}:`, error);
    // Don't throw - return message without media
    message.media.error = error.message;
    return message;
  }
}

/**
 * Generate unique event ID for deduplication
 * 
 * @param {object} message - Parsed message object
 * @returns {string} Unique event ID
 */
export function generateEventId(message) {
  const parts = [
    message.platform,
    message.eventType,
    message.messageId || message.timestamp,
    message.senderId,
  ];
  return parts.filter(Boolean).join('_');
}

export default {
  detectPlatform,
  parseWhatsAppWebhook,
  parseInstagramWebhook,
  parseWebhook,
  processMessageMedia,
  generateEventId,
};
