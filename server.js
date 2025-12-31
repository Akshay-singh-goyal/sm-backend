// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";
import newsletterRoutes from "./routes/newsletter.js";
const require = createRequire(import.meta.url);

const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const registerRoutes = require("./routes/registerRoutes");
const contactRoutes = require("./routes/contactRoutes");

dotenv.config();

const app = express();

/* ===== Middleware ===== */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== Database ===== */
connectDB();

/* ===== Routes ===== */
app.use("/api/auth", authRoutes);
app.use("/api/register", registerRoutes);
app.use("/api", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);

/* ===== Health Check ===== */
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server running 🚀" });
});

/* ===== Server ===== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
