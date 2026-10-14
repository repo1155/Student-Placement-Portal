const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedOption: { type: Number, default: null },
  correct: { type: Boolean, required: true }
}, { _id: false });

const responseSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedOption: { type: Number, default: null }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  questionKey: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  prompt: { type: String, required: true },
  options: { type: [String], required: true },
  correctOption: { type: Number, required: true },
  explanation: { type: String, required: true }
}, { _id: false });

const practiceAttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true },
  mode: { type: String, enum: ['quick', 'standard', 'mock'], default: 'standard' },
  topic: { type: String, default: null },
  durationSeconds: { type: Number, required: true, default: 900 },
  questionIds: { type: [String], required: true },
  questions: { type: [questionSchema], default: undefined },
  responses: { type: [responseSchema], default: [] },
  answers: { type: [answerSchema], default: [] },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress', index: true },
  startedAt: { type: Date, required: true, default: Date.now },
  completedAt: { type: Date },
  expiresAt: { type: Date, required: true },
  score: { type: Number, min: 0 },
  correctCount: { type: Number, min: 0 }
}, { timestamps: true });

practiceAttemptSchema.index({ student: 1, completedAt: -1 });
practiceAttemptSchema.index(
  { student: 1, 'questions.questionKey': 1 },
  { unique: true, partialFilterExpression: { 'questions.0': { $exists: true } } }
);

module.exports = mongoose.model('PracticeAttempt', practiceAttemptSchema);
