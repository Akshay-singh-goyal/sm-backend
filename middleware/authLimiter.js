const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // 10 requests
  message: "Too many attempts. Try again after 15 minutes.",
});
