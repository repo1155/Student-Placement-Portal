const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'employer'], required: true },
  school: { type: String, trim: true, maxlength: 120 },
  major: { type: String, trim: true, maxlength: 100 },
  graduationYear: { type: Number, min: 2020, max: 2100 },
  company: { type: String, trim: true, maxlength: 120 },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
