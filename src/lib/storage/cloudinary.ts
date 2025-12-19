import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to delete media from Cloudinary
export async function deleteFromCloudinary(publicId: string, resourceType: string = 'image') {
  try {
    // Map resource type for Cloudinary API
    const type = resourceType === 'raw' ? 'raw' : resourceType === 'video' ? 'video' : 'image';
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: type,
    });
    
    console.log('Cloudinary delete result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

// Helper function to get media details from Cloudinary
export async function getCloudinaryResource(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting Cloudinary resource:', error);
    throw error;
  }
}
