require("dotenv").config({ quiet: true });

const list = (v) => (v || "").split(",").map((s) => s.trim()).filter(Boolean);

const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  staffEmails: list(process.env.STAFF_EMAILS).map((e) => e.toLowerCase()),
  clientUrls: list(process.env.CLIENT_URL || "http://localhost:3000"),
  serverUrl: (process.env.SERVER_URL || "http://localhost:5000").replace(/\/$/, ""),
  deliveryFee: Number(process.env.DELIVERY_FEE) || 0,
  shop: {
    name: "Galela Okuhle Collection",
    whatsapp: process.env.SHOP_WHATSAPP || "27820743413",
    phone: process.env.SHOP_PHONE || "082 074 3413",
    email: process.env.SHOP_EMAIL || "mahlabs22@gmail.com",
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  payfast: {
    merchantId: process.env.PAYFAST_MERCHANT_ID,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY,
    passphrase: process.env.PAYFAST_PASSPHRASE || "",
    sandbox: process.env.PAYFAST_SANDBOX !== "false",
  },
  yoco: {
    secretKey: process.env.YOCO_SECRET_KEY,
    webhookSecret: process.env.YOCO_WEBHOOK_SECRET,
  },
};

config.clientUrl = config.clientUrls[0].replace(/\/$/, "");
config.payfast.enabled = Boolean(config.payfast.merchantId && config.payfast.merchantKey);
config.yoco.enabled = Boolean(config.yoco.secretKey);

module.exports = config;
