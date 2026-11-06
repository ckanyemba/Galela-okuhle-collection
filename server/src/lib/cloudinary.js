const { v2: cloudinary } = require("cloudinary");
const config = require("../config");

const enabled = Boolean(config.cloudinary.cloud_name && config.cloudinary.api_key && config.cloudinary.api_secret);
if (enabled) cloudinary.config({ ...config.cloudinary, secure: true });

function uploadBuffer(buffer, folder = "galela-okuhle/products") {
  if (!enabled) throw new Error("Cloudinary is not configured");
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }] },
      (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id }))
    );
    stream.end(buffer);
  });
}

async function destroyImage(publicId) {
  if (!enabled || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("Cloudinary delete failed", publicId, err.message);
  }
}

module.exports = { enabled, uploadBuffer, destroyImage };
