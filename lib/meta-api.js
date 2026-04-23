/**
 * Meta Graph API Messaging Utility
 * 
 * Complete implementation for sending WhatsApp and Instagram messages
 * Supports text, interactive messages, templates, and media
 * 
 * @module lib/meta-api
 */

const META_API_VERSION = process.env.META_API_VERSION || 'v18.0';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;

/**
 * Base function to make Meta Graph API requests
 * 
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} body - Request body
 * @returns {Promise<object>} API response
 */
async function makeMetaApiRequest(endpoint, method = 'POST', body = null) {
  try {
    if (!META_ACCESS_TOKEN) {
      throw new Error('META_ACCESS_TOKEN is not configured');
    }

    const url = `https://graph.facebook.com/${META_API_VERSION}/${endpoint}`;

    console.log(`📤 Meta API Request: ${method} ${endpoint}`);

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Meta API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
      });
      throw new Error(
        `Meta API Error: ${data.error?.message || response.statusText} (Code: ${data.error?.code || response.status})`
      );
    }

    console.log('✅ Meta API Request successful');
    return data;
  } catch (error) {
    console.error('❌ Meta API Request failed:', error);
    throw error;
  }
}

// ============================================
// WHATSAPP MESSAGING FUNCTIONS
// ============================================

/**
 * Send WhatsApp text message
 * 
 * @param {string} to - Recipient phone number (with country code, no + symbol)
 * @param {string} text - Message text
 * @param {boolean} previewUrl - Enable URL preview (default: true)
 * @returns {Promise<object>} Message send response
 */
export async function sendWhatsAppText(to, text, previewUrl = true) {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }

    if (!to || !text) {
      throw new Error('Recipient phone number and message text are required');
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/[^0-9]/g, ''), // Remove non-numeric characters
      type: 'text',
      text: {
        preview_url: previewUrl,
        body: text,
      },
    };

    const response = await makeMetaApiRequest(
      `${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      'POST',
      payload
    );

    console.log(`✅ WhatsApp text sent to ${to}: ${response.messages?.[0]?.id}`);
    
    return {
      success: true,
      messageId: response.messages?.[0]?.id,
      recipient: to,
      platform: 'whatsapp',
    };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp text to ${to}:`, error);
    throw error;
  }
}

/**
 * Send WhatsApp interactive button message
 * 
 * @param {string} to - Recipient phone number
 * @param {string} bodyText - Message body text
 * @param {array} buttonsArray - Array of button objects
 * @param {string} headerText - Optional header text
 * @param {string} footerText - Optional footer text
 * @returns {Promise<object>} Message send response
 * 
 * @example
 * sendWhatsAppInteractiveButtons('1234567890', 'Choose an option:', [
 *   { id: 'btn_1', title: 'Option 1' },
 *   { id: 'btn_2', title: 'Option 2' }
 * ])
 */
export async function sendWhatsAppInteractiveButtons(
  to,
  bodyText,
  buttonsArray,
  headerText = null,
  footerText = null
) {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }

    if (!to || !bodyText || !buttonsArray || buttonsArray.length === 0) {
      throw new Error('Recipient, body text, and buttons are required');
    }

    if (buttonsArray.length > 3) {
      throw new Error('WhatsApp allows maximum 3 buttons');
    }

    // Format buttons
    const buttons = buttonsArray.map((btn, index) => ({
      type: 'reply',
      reply: {
        id: btn.id || `btn_${index}`,
        title: btn.title.substring(0, 20), // Max 20 characters
      },
    }));

    const interactive = {
      type: 'button',
      body: {
        text: bodyText,
      },
      action: {
        buttons,
      },
    };

    if (headerText) {
      interactive.header = {
        type: 'text',
        text: headerText,
      };
    }

    if (footerText) {
      interactive.footer = {
        text: footerText,
      };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/[^0-9]/g, ''),
      type: 'interactive',
      interactive,
    };

    const response = await makeMetaApiRequest(
      `${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      'POST',
      payload
    );

    console.log(`✅ WhatsApp interactive buttons sent to ${to}`);
    
    return {
      success: true,
      messageId: response.messages?.[0]?.id,
      recipient: to,
      platform: 'whatsapp',
    };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp buttons to ${to}:`, error);
    throw error;
  }
}

/**
 * Send WhatsApp interactive list message
 * 
 * @param {string} to - Recipient phone number
 * @param {string} bodyText - Message body text
 * @param {string} buttonText - List button text (e.g., "View Options")
 * @param {array} sectionsArray - Array of section objects with rows
 * @param {string} headerText - Optional header text
 * @param {string} footerText - Optional footer text
 * @returns {Promise<object>} Message send response
 * 
 * @example
 * sendWhatsAppInteractiveList('1234567890', 'Choose a product:', 'View Products', [
 *   {
 *     title: 'Category 1',
 *     rows: [
 *       { id: 'prod_1', title: 'Product 1', description: 'Description 1' },
 *       { id: 'prod_2', title: 'Product 2', description: 'Description 2' }
 *     ]
 *   }
 * ])
 */
export async function sendWhatsAppInteractiveList(
  to,
  bodyText,
  buttonText,
  sectionsArray,
  headerText = null,
  footerText = null
) {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }

    if (!to || !bodyText || !buttonText || !sectionsArray || sectionsArray.length === 0) {
      throw new Error('Recipient, body text, button text, and sections are required');
    }

    // Format sections
    const sections = sectionsArray.map((section) => ({
      title: section.title || 'Options',
      rows: section.rows.map((row) => ({
        id: row.id,
        title: row.title.substring(0, 24), // Max 24 characters
        description: row.description ? row.description.substring(0, 72) : undefined, // Max 72 characters
      })),
    }));

    const interactive = {
      type: 'list',
      body: {
        text: bodyText,
      },
      action: {
        button: buttonText.substring(0, 20), // Max 20 characters
        sections,
      },
    };

    if (headerText) {
      interactive.header = {
        type: 'text',
        text: headerText,
      };
    }

    if (footerText) {
      interactive.footer = {
        text: footerText,
      };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/[^0-9]/g, ''),
      type: 'interactive',
      interactive,
    };

    const response = await makeMetaApiRequest(
      `${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      'POST',
      payload
    );

    console.log(`✅ WhatsApp interactive list sent to ${to}`);
    
    return {
      success: true,
      messageId: response.messages?.[0]?.id,
      recipient: to,
      platform: 'whatsapp',
    };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp list to ${to}:`, error);
    throw error;
  }
}

/**
 * Send WhatsApp template message
 * 
 * @param {string} to - Recipient phone number
 * @param {string} templateName - Template name (must be approved in Meta Business Manager)
 * @param {string} languageCode - Language code (e.g., 'en_US', 'en')
 * @param {array} components - Template components (header, body, buttons)
 * @returns {Promise<object>} Message send response
 * 
 * @example
 * sendWhatsAppTemplate('1234567890', 'welcome_message', 'en', [
 *   {
 *     type: 'body',
 *     parameters: [
 *       { type: 'text', text: 'John' }
 *     ]
 *   }
 * ])
 */
export async function sendWhatsAppTemplate(to, templateName, languageCode, components = []) {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }

    if (!to || !templateName || !languageCode) {
      throw new Error('Recipient, template name, and language code are required');
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/[^0-9]/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components: components,
      },
    };

    const response = await makeMetaApiRequest(
      `${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      'POST',
      payload
    );

    console.log(`✅ WhatsApp template sent to ${to}: ${templateName}`);
    
    return {
      success: true,
      messageId: response.messages?.[0]?.id,
      recipient: to,
      platform: 'whatsapp',
      templateName,
    };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp template to ${to}:`, error);
    throw error;
  }
}

/**
 * Send WhatsApp media message (image, video, document, audio)
 * 
 * @param {string} to - Recipient phone number
 * @param {string} mediaUrl - Media URL (must be publicly accessible)
 * @param {string} mediaType - Media type (image, video, document, audio)
 * @param {string} caption - Optional caption (for image/video)
 * @param {string} filename - Optional filename (for document)
 * @returns {Promise<object>} Message send response
 */
export async function sendWhatsAppMedia(to, mediaUrl, mediaType, caption = null, filename = null) {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }

    if (!to || !mediaUrl || !mediaType) {
      throw new Error('Recipient, media URL, and media type are required');
    }

    const validTypes = ['image', 'video', 'document', 'audio'];
    if (!validTypes.includes(mediaType)) {
      throw new Error(`Invalid media type. Must be one of: ${validTypes.join(', ')}`);
    }

    const mediaObject = {
      link: mediaUrl,
    };

    if (caption && (mediaType === 'image' || mediaType === 'video')) {
      mediaObject.caption = caption;
    }

    if (filename && mediaType === 'document') {
      mediaObject.filename = filename;
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/[^0-9]/g, ''),
      type: mediaType,
      [mediaType]: mediaObject,
    };

    const response = await makeMetaApiRequest(
      `${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      'POST',
      payload
    );

    console.log(`✅ WhatsApp ${mediaType} sent to ${to}`);
    
    return {
      success: true,
      messageId: response.messages?.[0]?.id,
      recipient: to,
      platform: 'whatsapp',
      mediaType,
    };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp ${mediaType} to ${to}:`, error);
    throw error;
  }
}

// ============================================
// INSTAGRAM MESSAGING FUNCTIONS
// ============================================

/**
 * Send Instagram text message
 * 
 * @param {string} to - Recipient Instagram-scoped ID (IGSID)
 * @param {string} text - Message text
 * @returns {Promise<object>} Message send response
 */
export async function sendInstagramText(to, text) {
  try {
    if (!INSTAGRAM_ACCOUNT_ID) {
      throw new Error('INSTAGRAM_ACCOUNT_ID is not configured');
    }

    if (!to || !text) {
      throw new Error('Recipient ID and message text are required');
    }

    const payload = {
      recipient: {
        id: to,
      },
      message: {
        text: text,
      },
    };

    const response = await makeMetaApiRequest(
      `${INSTAGRAM_ACCOUNT_ID}/messages`,
      'POST',
      payload
    );

    console.log(`✅ Instagram text sent to ${to}: ${response.message_id}`);
    
    return {
      success: true,
      messageId: response.message_id,
      recipientId: response.recipient_id,
      platform: 'instagram',
    };
  } catch (error) {
    console.error(`❌ Failed to send Instagram text to ${to}:`, error);
    throw error;
  }
}

/**
 * Send Instagram message with quick replies
 * 
 * @param {string} to - Recipient Instagram-scoped ID
 * @param {string} text - Message text
 * @param {array} repliesArray - Array of quick reply objects (max 13)
 * @returns {Promise<object>} Message send response
 * 
 * @example
 * sendInstagramQuickReplies('1234567890', 'Choose an option:', [
 *   { content_type: 'text', title: 'Option 1', payload: 'opt_1' },
 *   { content_type: 'text', title: 'Option 2', payload: 'opt_2' }
 * ])
 */
export async function sendInstagramQuickReplies(to, text, repliesArray) {
  try {
    if (!INSTAGRAM_ACCOUNT_ID) {
      throw new Error('INSTAGRAM_ACCOUNT_ID is not configured');
    }

    if (!to || !text || !repliesArray || repliesArray.length === 0) {
      throw new Error('Recipient, text, and quick replies are required');
    }

    if (repliesArray.length > 13) {
      throw new Error('Instagram allows maximum 13 quick replies');
    }

    const quickReplies = repliesArray.map((reply) => ({
      content_type: reply.content_type || 'text',
      title: reply.title.substring(0, 20), // Max 20 characters
      payload: reply.payload || reply.title,
      image_url: reply.image_url || undefined,
    }));

    const payload = {
      recipient: {
        id: to,
      },
      message: {
        text: text,
        quick_replies: quickReplies,
      },
    };

    const response = await makeMetaApiRequest(
      `${INSTAGRAM_ACCOUNT_ID}/messages`,
      'POST',
      payload
    );

    console.log(`✅ Instagram quick replies sent to ${to}`);
    
    return {
      success: true,
      messageId: response.message_id,
      recipientId: response.recipient_id,
      platform: 'instagram',
    };
  } catch (error) {
    console.error(`❌ Failed to send Instagram quick replies to ${to}:`, error);
    throw error;
  }
}

/**
 * Send Instagram media message (image, video, audio, file)
 * 
 * @param {string} to - Recipient Instagram-scoped ID
 * @param {string} mediaUrl - Media URL
 * @param {string} mediaType - attachment type (image, video, audio, file)
 * @returns {Promise<object>} Message send response
 */
export async function sendInstagramMedia(to, mediaUrl, mediaType = 'image') {
  try {
    if (!INSTAGRAM_ACCOUNT_ID) {
      throw new Error('INSTAGRAM_ACCOUNT_ID is not configured');
    }

    if (!to || !mediaUrl) {
      throw new Error('Recipient ID and media URL are required');
    }

    const validTypes = ['image', 'video', 'audio', 'file'];
    if (!validTypes.includes(mediaType)) {
      throw new Error(`Invalid media type. Must be one of: ${validTypes.join(', ')}`);
    }

    const payload = {
      recipient: {
        id: to,
      },
      message: {
        attachment: {
          type: mediaType,
          payload: {
            url: mediaUrl,
            is_reusable: true,
          },
        },
      },
    };

    const response = await makeMetaApiRequest(
      `${INSTAGRAM_ACCOUNT_ID}/messages`,
      'POST',
      payload
    );

    console.log(`✅ Instagram ${mediaType} sent to ${to}`);
    
    return {
      success: true,
      messageId: response.message_id,
      recipientId: response.recipient_id,
      platform: 'instagram',
      mediaType,
    };
  } catch (error) {
    console.error(`❌ Failed to send Instagram ${mediaType} to ${to}:`, error);
    throw error;
  }
}

// ============================================
// UNIFIED MESSAGING FUNCTION
// ============================================

/**
 * Universal function to send media message to WhatsApp or Instagram
 * 
 * @param {string} to - Recipient (phone number for WA, IGSID for IG)
 * @param {string} platform - Platform ('whatsapp' or 'instagram')
 * @param {string} mediaUrl - Media URL
 * @param {string} mediaType - Media type
 * @param {object} options - Additional options (caption, filename)
 * @returns {Promise<object>} Message send response
 */
export async function sendMediaMessage(to, platform, mediaUrl, mediaType, options = {}) {
  try {
    if (platform === 'whatsapp') {
      return await sendWhatsAppMedia(
        to,
        mediaUrl,
        mediaType,
        options.caption,
        options.filename
      );
    } else if (platform === 'instagram') {
      return await sendInstagramMedia(to, mediaUrl, mediaType);
    } else {
      throw new Error(`Invalid platform: ${platform}. Must be 'whatsapp' or 'instagram'`);
    }
  } catch (error) {
    console.error(`❌ Failed to send media message:`, error);
    throw error;
  }
}

/**
 * Mark WhatsApp message as read
 * 
 * @param {string} messageId - Message ID to mark as read
 * @returns {Promise<object>} Response
 */
export async function markWhatsAppMessageAsRead(messageId) {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }

    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };

    const response = await makeMetaApiRequest(
      `${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      'POST',
      payload
    );

    console.log(`✅ WhatsApp message marked as read: ${messageId}`);
    return response;
  } catch (error) {
    console.error(`❌ Failed to mark WhatsApp message as read:`, error);
    throw error;
  }
}

export default {
  // WhatsApp functions
  sendWhatsAppText,
  sendWhatsAppInteractiveButtons,
  sendWhatsAppInteractiveList,
  sendWhatsAppTemplate,
  sendWhatsAppMedia,
  markWhatsAppMessageAsRead,
  
  // Instagram functions
  sendInstagramText,
  sendInstagramQuickReplies,
  sendInstagramMedia,
  
  // Unified functions
  sendMediaMessage,
};
