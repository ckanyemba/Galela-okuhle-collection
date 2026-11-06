const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const config = require("../config");
const { requireStaff } = require("../middleware/auth");

const router = Router();
const client = new OAuth2Client(config.googleClientId);

// Staff sign in: the client sends the Google ID token from Google Identity Services.
router.post("/google", async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: "Missing Google credential" });

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: config.googleClientId });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: "Google sign-in could not be verified" });
  }

  const email = (payload.email || "").toLowerCase();
  if (!payload.email_verified || !config.staffEmails.includes(email)) {
    return res.status(403).json({ error: `${email} is not registered as staff` });
  }

  const staff = { email, name: payload.name, picture: payload.picture };
  const token = jwt.sign(staff, config.jwtSecret, { expiresIn: "7d" });
  res.json({ token, staff });
});

router.get("/me", requireStaff, (req, res) => {
  const { email, name, picture } = req.staff;
  res.json({ staff: { email, name, picture } });
});

module.exports = router;
