import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    branch: {
      type: String,
      required: true,
    },

    subjectName: {
      type: String,
      required: true,
    },

    subjectCodes: [
      {
        code: {
          type: String,
          required: true,
        },
        branch: {
          type: String,
          required: true,
        },
        department: {
          type: String,
          required: true,
        },
      },
    ],

    year: {
      type: Number,
      required: true,
    },

    semester: {
      type: Number,
      required: true,
    },

    topicName: {
      type: String,
      required: true,
    },

    topicDetails: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
