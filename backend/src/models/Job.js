const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  companyLogo: { type: String, trim: true, maxlength: 8, default: '' },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], required: true },
  type: { type: String, enum: ['Internship', 'Co-op', 'Graduate'], default: 'Internship' },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  pay: { type: String, required: true, trim: true, maxlength: 60 },
  duration: { type: String, required: true, trim: true, maxlength: 60 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  requirements: [{ type: String, trim: true, maxlength: 180 }],
  skills: [{ type: String, trim: true, maxlength: 40 }],
  deadline: { type: Date },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', category: 'text', location: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
