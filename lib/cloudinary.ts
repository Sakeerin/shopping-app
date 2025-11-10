import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// ============================================================================
// UPLOAD HELPERS
// ============================================================================

interface UploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadImage(
  file: string,
  folder: string = 'products'
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'image',
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
        },
      ],
    });

    return {
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

export async function uploadMultipleImages(
  files: string[],
  folder: string = 'products'
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return await Promise.all(uploadPromises);
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
}

export async function deleteMultipleImages(publicIds: string[]): Promise<void> {
  try {
    await cloudinary.api.delete_resources(publicIds);
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    throw new Error('Failed to delete images');
  }
}

// ============================================================================
// TRANSFORMATION HELPERS
// ============================================================================

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
): string {
  const { width = 800, height = 800, crop = 'limit', quality = 'auto:good' } = options;

  return cloudinary.url(publicId, {
    transformation: [
      {
        width,
        height,
        crop,
        quality,
        fetch_format: 'auto',
      },
    ],
  });
}

export function getThumbnailUrl(publicId: string): string {
  return getOptimizedImageUrl(publicId, {
    width: 200,
    height: 200,
    crop: 'fill',
  });
}
