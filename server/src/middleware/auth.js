const jwt = require("jsonwebtoken");
const config = require("../config");

function requireStaff(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not signed in" });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    // Re-check the allowlist so removing an email revokes access immediately.
    if (!config.staffEmails.includes(payload.email)) {
      return res.status(403).json({ error: "Not a staff account" });
    }
    req.staff = payload;
    next();
  } catch {
    res.status(401).json({ error: "Session expired, please sign in again" });
  }
}

module.exports = { requireStaff };
