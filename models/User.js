import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Highlight Schema
const HighlightSchema = new mongoose.Schema({
  text: { type: String, required: true },
  color: { type: String, required: true },
});

// Main User Schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },

    avatar: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/8.x/bottts/svg?seed=${this.name}`;
      },
    },

    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    downloadHistory: [
      {
        fileId: String,
        title: String,
        date: { type: Date, default: Date.now },
      },
    ],
    savedNotes: [{ title: String, url: String }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    paymentHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],

    // Notes features
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],

    highlights: {
      type: Map,
      of: [HighlightSchema],
      default: {},
    },

    // Authentication & security
    refreshToken: { type: String, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Number, default: null },

    // User settings
    settings: {
      notifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
    },

    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

// Password hashing middleware
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export model
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
