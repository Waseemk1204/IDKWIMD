import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';
import { Readable } from 'stream';

// Configure Cloudinary
if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.warn('⚠️  Cloudinary not configured. Profile photo uploads will not work.');
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload image to Cloudinary
 * @param file - Multer file object or buffer
 * @param folder - Cloudinary folder path (optional)
 * @param publicId - Custom public ID (optional)
 * @returns Upload result with secure URL
 */
export const uploadImage = async (
  file: Express.Multer.File | Buffer,
  folder: string = 'profile-photos',
  publicId?: string
): Promise<UploadResult> => {
  if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables.');
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Crop to square, focus on face
        { quality: 'auto', fetch_format: 'auto' } // Optimize image
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // Handle both multer file and buffer
    if (Buffer.isBuffer(file)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      );
      
      const bufferStream = new Readable();
      bufferStream.push(file);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    } else {
      // Multer file object
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      );

      // Create readable stream from buffer
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    }
  });
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns Deletion result
 */
export const deleteImage = async (publicId: string): Promise<any> => {
  if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured');
  }

  return cloudinary.uploader.destroy(publicId);
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID or null
 */
export const extractPublicId = (url: string): string | null => {
  try {
    const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)/);
    if (match && match[1]) {
      // Remove folder prefix if present
      return match[1].replace(/^profile-photos\//, '');
    }
    return null;
  } catch {
    return null;
  }
};

export default {
  uploadImage,
  deleteImage,
  extractPublicId
};

