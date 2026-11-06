const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config");
const connectDB = require("./db");

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || config.clientUrls.includes(origin)),
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Public storefront settings the client needs.
app.get("/api/config", (req, res) => {
  res.json({
    shop: config.shop,
    deliveryFee: config.deliveryFee,
    payments: { payfast: config.payfast.enabled, yoco: config.yoco.enabled, whatsapp: true, email: true, cash: true },
  });
});

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Payment webhooks parse their own bodies (raw / urlencoded), so mount them before express.json().
app.use("/api/payments", require("./routes/payments"));
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/uploads", require("./routes/uploads"));

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError") return res.status(400).json({ error: err.message });
  if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "Image is too large (max 8 MB)" });
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = app;
