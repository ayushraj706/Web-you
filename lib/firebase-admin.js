/**
 * Firebase Admin SDK Initialization
 * 
 * This module initializes the Firebase Admin SDK for server-side operations.
 * It ensures a singleton pattern to prevent multiple initializations.
 * 
 * @module lib/firebase-admin
 */

import admin from 'firebase-admin';

/**
 * Global variable to store the Firebase app instance
 * This ensures we don't initialize multiple times
 */
let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 * 
 * @returns {admin.app.App} Firebase app instance
 * @throws {Error} If initialization fails
 */
export function initializeFirebaseAdmin() {
  // Return existing instance if already initialized
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if any Firebase app is already initialized
    if (admin.apps.length > 0) {
      firebaseApp = admin.app();
      console.log('✅ Firebase Admin: Using existing instance');
      return firebaseApp;
    }

    // Parse service account from environment variable
    let serviceAccount;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Method 1: Use complete service account JSON
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log('📝 Firebase Admin: Using FIREBASE_SERVICE_ACCOUNT_KEY');
      } catch (parseError) {
        console.error('❌ Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.');
      }
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      // Method 2: Use individual credentials
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
      console.log('📝 Firebase Admin: Using individual credentials');
    } else {
      throw new Error(
        'Firebase credentials not found. Please set either FIREBASE_SERVICE_ACCOUNT_KEY or individual credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)'
      );
    }

    // Initialize Firebase Admin with credentials
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optional: Set database URL if using Realtime Database
      // databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
    });

    console.log(`✅ Firebase Admin: Initialized successfully for project: ${serviceAccount.projectId || serviceAccount.project_id}`);
    
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase Admin: Initialization failed');
    console.error('Error details:', error.message);
    throw error;
  }
}

/**
 * Get Firestore database instance
 * 
 * @returns {admin.firestore.Firestore} Firestore instance
 */
export function getFirestore() {
  const app = initializeFirebaseAdmin();
  return app.firestore();
}

/**
 * Get Firebase Auth instance
 * 
 * @returns {admin.auth.Auth} Auth instance
 */
export function getAuth() {
  const app = initializeFirebaseAdmin();
  return app.auth();
}

/**
 * Get Firebase Storage instance
 * 
 * @returns {admin.storage.Storage} Storage instance
 */
export function getStorage() {
  const app = initializeFirebaseAdmin();
  return app.storage();
}

/**
 * Firestore helper: Save message to conversation
 * 
 * @param {string} conversationId - Unique conversation identifier (phone number or Instagram ID)
 * @param {object} messageData - Message data object
 * @param {string} platform - Platform identifier ('whatsapp' or 'instagram')
 * @returns {Promise<object>} Saved message document reference
 */
export async function saveMessageToFirestore(conversationId, messageData, platform) {
  try {
    const db = getFirestore();
    
    // Create or update conversation document
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();
    
    const conversationUpdate = {
      platform,
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessageText: messageData.text || messageData.type || '',
      lastMessageType: messageData.type,
      lastMessageSenderId: messageData.senderId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!conversationDoc.exists) {
      // Create new conversation
      await conversationRef.set({
        ...conversationUpdate,
        conversationId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        unreadCount: 1,
        participantId: conversationId,
        metadata: {
          platform,
          source: 'webhook',
        },
      });
      console.log(`📝 Created new conversation: ${conversationId}`);
    } else {
      // Update existing conversation
      await conversationRef.update({
        ...conversationUpdate,
        unreadCount: admin.firestore.FieldValue.increment(1),
      });
      console.log(`📝 Updated conversation: ${conversationId}`);
    }

    // Add message to messages subcollection
    const messageRef = await conversationRef.collection('messages').add({
      ...messageData,
      conversationId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Message saved to Firestore: ${messageRef.id}`);

    return {
      conversationId,
      messageId: messageRef.id,
      success: true,
    };
  } catch (error) {
    console.error('❌ Failed to save message to Firestore:', error);
    throw error;
  }
}

/**
 * Firestore helper: Get conversation messages
 * 
 * @param {string} conversationId - Conversation identifier
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise<array>} Array of message objects
 */
export async function getConversationMessages(conversationId, limit = 50) {
  try {
    const db = getFirestore();
    const messagesSnapshot = await db
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const messages = [];
    messagesSnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return messages;
  } catch (error) {
    console.error('❌ Failed to get conversation messages:', error);
    throw error;
  }
}

/**
 * Firestore helper: Mark conversation as read
 * 
 * @param {string} conversationId - Conversation identifier
 * @returns {Promise<void>}
 */
export async function markConversationAsRead(conversationId) {
  try {
    const db = getFirestore();
    await db.collection('conversations').doc(conversationId).update({
      unreadCount: 0,
      lastReadAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Marked conversation as read: ${conversationId}`);
  } catch (error) {
    console.error('❌ Failed to mark conversation as read:', error);
    throw error;
  }
}

/**
 * Firestore helper: Check if webhook event was already processed (deduplication)
 * 
 * @param {string} eventId - Unique webhook event ID
 * @param {number} ttlMinutes - Time-to-live in minutes (default: 60)
 * @returns {Promise<boolean>} True if event was already processed
 */
export async function isWebhookEventProcessed(eventId, ttlMinutes = 60) {
  try {
    const db = getFirestore();
    const eventRef = db.collection('webhook_events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (eventDoc.exists) {
      console.log(`⚠️ Duplicate webhook event detected: ${eventId}`);
      return true;
    }

    // Store event with TTL
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    await eventRef.set({
      eventId,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    });

    return false;
  } catch (error) {
    console.error('❌ Failed to check webhook event:', error);
    // If check fails, allow processing to continue (better to process twice than miss)
    return false;
  }
}

/**
 * Cleanup old webhook events (call this periodically via cron job)
 * 
 * @returns {Promise<number>} Number of deleted events
 */
export async function cleanupOldWebhookEvents() {
  try {
    const db = getFirestore();
    const now = admin.firestore.Timestamp.now();
    
    const expiredEvents = await db
      .collection('webhook_events')
      .where('expiresAt', '<', now)
      .limit(500) // Process in batches
      .get();

    if (expiredEvents.empty) {
      return 0;
    }

    const batch = db.batch();
    expiredEvents.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🗑️ Cleaned up ${expiredEvents.size} expired webhook events`);
    
    return expiredEvents.size;
  } catch (error) {
    console.error('❌ Failed to cleanup webhook events:', error);
    return 0;
  }
}

// Export admin for advanced use cases
export { admin };

// Export Firestore for direct access
export const db = getFirestore();

export default {
  initializeFirebaseAdmin,
  getFirestore,
  getAuth,
  getStorage,
  saveMessageToFirestore,
  getConversationMessages,
  markConversationAsRead,
  isWebhookEventProcessed,
  cleanupOldWebhookEvents,
  admin,
  db,
};
