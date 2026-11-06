const { Router } = require("express");
const multer = require("multer");
const { requireStaff } = require("../middleware/auth");
const cloud = require("../lib/cloudinary");

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|heic|heif)$/.test(file.mimetype)),
});

router.post("/", requireStaff, upload.array("images", 10), async (req, res) => {
  if (!cloud.enabled) return res.status(503).json({ error: "Image uploads are not configured (Cloudinary keys missing)" });
  if (!req.files?.length) return res.status(400).json({ error: "No images received (JPG, PNG, WEBP or HEIC up to 8 MB)" });
  const images = await Promise.all(req.files.map((f) => cloud.uploadBuffer(f.buffer)));
  res.status(201).json({ images });
});

module.exports = router;
