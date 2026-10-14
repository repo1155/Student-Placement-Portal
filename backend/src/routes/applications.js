const express = require('express');
const { z } = require('zod');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncRoute, validate } = require('../utils/validation');

const router = express.Router();

router.post('/jobs/:jobId/applications', authenticate, requireRole('student'), asyncRoute(async (req, res) => {
  const data = validate(z.object({
    coverLetter: z.string().trim().max(3000).optional().default(''),
    resumeUrl: z.string().trim().url().max(500).optional().or(z.literal('')).default('')
  }), req.body);
  const job = await Job.findOne({ _id: req.params.jobId, status: 'open' });
  if (!job) return res.status(404).json({ message: 'This opportunity is no longer open.' });
  const existing = await Application.exists({ job: job.id, student: req.user.id });
  if (existing) return res.status(409).json({ message: 'You have already applied to this opportunity.' });

  const application = await Application.create({ ...data, job: job.id, student: req.user.id });
  res.status(201).json({ application });
}));

router.get('/mine', authenticate, requireRole('student'), asyncRoute(async (req, res) => {
  const applications = await Application.find({ student: req.user.id })
    .populate({ path: 'job', populate: { path: 'employer', select: 'company' } })
    .sort({ createdAt: -1 }).lean();
  res.json({ applications });
}));

router.patch('/:id/status', authenticate, requireRole('employer'), asyncRoute(async (req, res) => {
  const data = validate(z.object({
    status: z.enum(['reviewing', 'interview', 'offer', 'rejected'])
  }), req.body);
  const application = await Application.findById(req.params.id).populate('job');
  if (!application || application.job.employer.toString() !== req.user.id) {
    return res.status(404).json({ message: 'Application not found.' });
  }
  application.status = data.status;
  await application.save();
  res.json({ application });
}));

module.exports = router;
