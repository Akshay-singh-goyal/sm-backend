// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

/* ===== Load environment variables ===== */
dotenv.config();

/* ===== Initialize express app ===== */
const app = express();

/* ===== CORS FIX (VERY IMPORTANT) ===== */
app.use(
  cors({
    origin: [
      "https://theitwallah.vercel.app", // frontend (production)
      "http://localhost:3000",          // frontend (local)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 Preflight request fix
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== Database ===== */
import connectDB from "./config/db.js";
connectDB();

/* ===== Routes ===== */
import authRoutes from "./routes/authRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/register", registerRoutes);
app.use("/api", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);

/* ===== Health Check ===== */
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server running 🚀" });
});

/* ===== Server ===== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
