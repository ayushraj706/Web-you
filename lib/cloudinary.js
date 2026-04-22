/**
 * Cloudinary Media Upload Utility
 * 
 * Handles media downloads from Meta APIs and uploads to Cloudinary
 * 
 * @module lib/cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';

/**
 * Initialize Cloudinary configuration
 */
export function initializeCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are not configured. Check your .env file.');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log('✅ Cloudinary initialized successfully');
  return cloudinary;
}

/**
 * Fetch media from Meta Graph API using Media ID
 * 
 * @param {string} mediaId - Meta media ID
 * @param {string} accessToken - Meta access token
 * @returns {Promise<object>} Media URL and metadata
 */
export async function fetchMetaMediaUrl(mediaId, accessToken) {
  try {
    const apiVersion = process.env.META_API_VERSION || 'v18.0';
    const url = `https://graph.facebook.com/${apiVersion}/${mediaId}`;

    console.log(`📥 Fetching media URL for ID: ${mediaId}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Meta API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Media URL fetched successfully: ${data.url?.substring(0, 50)}...`);
    
    return {
      url: data.url,
      mimeType: data.mime_type,
      sha256: data.sha256,
      fileSize: data.file_size,
    };
  } catch (error) {
    console.error(`❌ Failed to fetch media URL for ID ${mediaId}:`, error);
    throw error;
  }
}

/**
 * Download media buffer from Meta's CDN
 * 
 * @param {string} mediaUrl - Meta media CDN URL
 * @param {string} accessToken - Meta access token
 * @returns {Promise<Buffer>} Media file buffer
 */
export async function downloadMetaMedia(mediaUrl, accessToken) {
  try {
    console.log(`📥 Downloading media from Meta CDN...`);

    const response = await fetch(mediaUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download media: ${response.statusText}`);
    }

    // Convert response to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`✅ Media downloaded successfully (${(buffer.length / 1024).toFixed(2)} KB)`);
    
    return buffer;
  } catch (error) {
    console.error('❌ Failed to download media from Meta:', error);
    throw error;
  }
}

/**
 * Upload buffer to Cloudinary
 * 
 * @param {Buffer} buffer - Media file buffer
 * @param {object} options - Upload options
 * @param {string} options.folder - Cloudinary folder path
 * @param {string} options.resourceType - Resource type (image, video, raw, auto)
 * @param {string} options.publicId - Custom public ID (optional)
 * @param {object} options.tags - Array of tags
 * @returns {Promise<object>} Cloudinary upload result
 */
export async function uploadBufferToCloudinary(buffer, options = {}) {
  try {
    const cloud = initializeCloudinary();

    const {
      folder = process.env.CLOUDINARY_FOLDER || 'omnichannel-inbox',
      resourceType = 'auto',
      publicId = null,
      tags = ['omnichannel', 'inbox'],
    } = options;

    console.log(`📤 Uploading to Cloudinary (${resourceType})...`);

    return new Promise((resolve, reject) => {
      const uploadStream = cloud.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          public_id: publicId,
          tags,
          // Enable automatic optimization
          quality: 'auto',
          fetch_format: 'auto',
          // Add unique filename to prevent overwriting
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload failed:', error);
            reject(error);
          } else {
            console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
            resolve(result);
          }
        }
      );

      // Write buffer to upload stream
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('❌ Failed to upload to Cloudinary:', error);
    throw error;
  }
}

/**
 * Complete workflow: Fetch from Meta and upload to Cloudinary
 * 
 * @param {string} mediaId - Meta media ID
 * @param {string} accessToken - Meta access token
 * @param {object} metadata - Additional metadata (platform, messageId, etc.)
 * @returns {Promise<object>} Cloudinary URL and metadata
 */
export async function processAndUploadMetaMedia(mediaId, accessToken, metadata = {}) {
  try {
    console.log(`🔄 Processing media ID: ${mediaId}`);

    // Step 1: Fetch media URL from Meta
    const mediaInfo = await fetchMetaMediaUrl(mediaId, accessToken);

    // Step 2: Download media buffer
    const buffer = await downloadMetaMedia(mediaInfo.url, accessToken);

    // Step 3: Determine resource type based on MIME type
    let resourceType = 'auto';
    if (mediaInfo.mimeType) {
      if (mediaInfo.mimeType.startsWith('image/')) {
        resourceType = 'image';
      } else if (mediaInfo.mimeType.startsWith('video/')) {
        resourceType = 'video';
      } else if (mediaInfo.mimeType.startsWith('audio/')) {
        resourceType = 'video'; // Cloudinary uses 'video' for audio files
      } else {
        resourceType = 'raw'; // Documents, PDFs, etc.
      }
    }

    // Step 4: Upload to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(buffer, {
      resourceType,
      tags: [
        'omnichannel',
        metadata.platform || 'unknown',
        metadata.messageType || 'media',
      ],
    });

    console.log(`✅ Media processing complete for ${mediaId}`);

    return {
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      originalUrl: mediaInfo.url,
      mimeType: mediaInfo.mimeType,
      fileSize: mediaInfo.fileSize,
      sha256: mediaInfo.sha256,
      resourceType: uploadResult.resource_type,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      duration: uploadResult.duration, // For audio/video
    };
  } catch (error) {
    console.error(`❌ Failed to process and upload media ${mediaId}:`, error);
    throw error;
  }
}

/**
 * Upload media from URL directly to Cloudinary
 * 
 * @param {string} mediaUrl - Public media URL
 * @param {object} options - Upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
export async function uploadFromUrl(mediaUrl, options = {}) {
  try {
    const cloud = initializeCloudinary();

    const {
      folder = process.env.CLOUDINARY_FOLDER || 'omnichannel-inbox',
      resourceType = 'auto',
      tags = ['omnichannel', 'inbox'],
    } = options;

    console.log(`📤 Uploading from URL to Cloudinary...`);

    const result = await cloud.uploader.upload(mediaUrl, {
      folder,
      resource_type: resourceType,
      tags,
      quality: 'auto',
      fetch_format: 'auto',
      unique_filename: true,
      overwrite: false,
    });

    console.log(`✅ Uploaded from URL to Cloudinary: ${result.secure_url}`);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to upload from URL:', error);
    throw error;
  }
}

/**
 * Delete media from Cloudinary
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<object>} Deletion result
 */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    const cloud = initializeCloudinary();

    console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);

    const result = await cloud.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log(`✅ Deleted from Cloudinary: ${publicId}`);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to delete from Cloudinary:', error);
    throw error;
  }
}

/**
 * Get media metadata from Cloudinary
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type
 * @returns {Promise<object>} Media metadata
 */
export async function getCloudinaryMetadata(publicId, resourceType = 'image') {
  try {
    const cloud = initializeCloudinary();

    const result = await cloud.api.resource(publicId, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    console.error('❌ Failed to get Cloudinary metadata:', error);
    throw error;
  }
}

export default {
  initializeCloudinary,
  fetchMetaMediaUrl,
  downloadMetaMedia,
  uploadBufferToCloudinary,
  processAndUploadMetaMedia,
  uploadFromUrl,
  deleteFromCloudinary,
  getCloudinaryMetadata,
};
