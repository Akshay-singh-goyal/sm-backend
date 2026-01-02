import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    batchId: {
      type: String,
      default: "default123",
    },

    mode: {
      type: String,
      enum: ["PAID", "UNPAID"],
    },

    status: {
      type: String,
      enum: [
        "NOT_REGISTERED",
        "MODE_SELECTED",
        "WAITING_ADMIN",
        "ADMIN_APPROVED",
        "SEAT_CONFIRMED",
      ],
      default: "NOT_REGISTERED",
    },

    adminApproved: {
      type: Boolean,
      default: false,
    },

    registrationTxnId: String,
    courseTxnId: String,

    testSlot: {
      date: String,
      time: String,
    },

    termsAccepted: Boolean,
  },
  { timestamps: true }
);

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
