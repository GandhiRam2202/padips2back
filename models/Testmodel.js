import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  test: { type: Number, required: true }, // e.g., 1
  questionNo: { type: Number, required: true },
  questionType: { 
    type: String, 
    enum: ['mcq', 'match_the_following'], 
    default: 'mcq' 
  },
  question: {
    tamil: { type: String, required: true },
    english: { type: String, required: true },
    images: [String] // Array of image URLs/paths
  },
  // For MCQs
  options: [{
    tamil: String,
    english: String
  }],
  correctAnswer: { type: Number }, // 1, 2, 3, or 4
  // For Match the Following
  matchLeft: [{
    key: String, // e.g., "A"
    tamil: String,
    english: String
  }],
  matchRight: [{
    key: String, // e.g., "1"
    tamil: String,
    english: String
  }],
  explanation: {
    tamil: String,
    english: String
  },
  exam: { type: String }, // e.g., "Group 1"
  subject: { type: String },
  chapter: { type: String }
}, { timestamps: true });

export default mongoose.model('Testmodels', questionSchema);