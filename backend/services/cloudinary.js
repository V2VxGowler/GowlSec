import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Configuration Cloudinary manquante. Vérifie les variables d’environnement."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function uploadProfileImage(
  buffer,
  { publicId, width, height }
) {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
        format: "webp",
        transformation: [
          {
            width,
            height,
            crop: "fill",
            gravity: "auto",
            quality: "auto:good",
          },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export async function deleteProfileImage(publicId) {
  if (!publicId) return;
  configureCloudinary();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}
