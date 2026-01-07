// models/Contact.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    category: {
      type: String,
      default: "Other",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    reply: {
      type: String, // admin reply
      default: "",
    },
    resolved: {
      type: Boolean, // ticket resolved status
      default: false,
    },
  },
  { timestamps: true } // createdAt and updatedAt
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
