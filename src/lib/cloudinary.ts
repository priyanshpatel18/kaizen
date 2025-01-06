import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(fileUri: string, fileName?: string) {
  try {
    const options: Record<string, any> = {
      invalidate: true,
      resource_type: "auto",
      folder: "kaizen",
    };

    if (fileName) {
      options.filename_override = fileName;
      options.use_filename = true;
    }

    const response = await cloudinary.uploader.upload(fileUri, options);

    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    const response = await cloudinary.uploader.destroy(publicId);

    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}
