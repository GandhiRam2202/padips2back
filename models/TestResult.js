import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  test: { type: Number, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Optional: Prevent duplicate submissions at database level
testResultSchema.index({ email: 1, test: 1 }, { unique: true });

export default mongoose.model('testsubmits', testResultSchema);