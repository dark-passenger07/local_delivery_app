import "dotenv/config";
import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiResponse,
} from "cloudinary";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  // Warn instead of throwing so the rest of the server still boots in dev even
  // when Cloudinary keys are not configured yet. Upload requests will fail with
  // a clear error until these are set in the backend .env file.
  console.warn(
    "[cloudinary] Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET. Image uploads will fail until these are set in .env."
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

/**
 * Upload an in-memory image buffer to Cloudinary using an upload stream, so the
 * file never touches the server's disk. Resolves with the https secure_url and
 * the public_id. The image is capped at 512x512 (crop: "limit") to keep avatars
 * small and consistent.
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder = "vendor_profiles"
): Promise<CloudinaryUploadResult> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        overwrite: true,
        transformation: [{ width: 512, height: 512, crop: "limit" }],
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error ?? new Error("Cloudinary upload failed"));
        }
        resolve({ secureUrl: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

export default cloudinary;
