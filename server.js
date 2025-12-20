// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// CommonJS modules
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js"); // login + refresh token
// const adminRoutes = require("./routes/admin.js"); // admin protected routes

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===== Routes =====
app.use("/api/auth", authRoutes);        // login + refresh token
// app.use("/api/admin", adminRoutes);       // admin routes



app.get("/", (req, res) => {
  res.send("Server running...");
});

// ===== Server Start =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
