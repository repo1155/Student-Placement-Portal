const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  coverLetter: { type: String, trim: true, maxlength: 3000, default: '' },
  resumeUrl: { type: String, trim: true, maxlength: 500, default: '' },
  status: {
    type: String,
    enum: ['submitted', 'reviewing', 'interview', 'offer', 'rejected'],
    default: 'submitted'
  }
}, { timestamps: true });

applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
