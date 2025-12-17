import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 👇 CommonJS support
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// CommonJS files
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const registerRoutes = require("./routes/registerRoutes.js");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/register", registerRoutes);

app.get("/", (req, res) => {
  res.send("Server running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
