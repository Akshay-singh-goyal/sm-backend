const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },

    // Avatar
    avatar: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/8.x/bottts/svg?seed=${this.name}`;
      },
    },

    // Learning / Purchases
    completedCourses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    ],

    purchasedBooks: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    ],

    downloadHistory: [
      {
        fileId: String,
        title: String,
        date: { type: Date, default: Date.now },
      },
    ],

    savedNotes: [
      {
        title: String,
        url: String,
      },
    ],

    wishlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    ],

    paymentHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    ],

    // 🔐 Auth & Security
    refreshToken: {
      type: String,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Number,
      default: null,
    },

    // User Settings
    settings: {
      notifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
