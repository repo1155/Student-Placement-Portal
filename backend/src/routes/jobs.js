const express = require('express');
const { z } = require('zod');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncRoute, validate } = require('../utils/validation');

const router = express.Router();
const jobSchema = z.object({
  title: z.string().trim().min(3).max(120),
  companyLogo: z.string().trim().max(8).optional(),
  location: z.string().trim().min(2).max(120),
  workMode: z.enum(['Remote', 'Hybrid', 'On-site']),
  type: z.enum(['Internship', 'Co-op', 'Graduate']).default('Internship'),
  category: z.string().trim().min(2).max(60),
  pay: z.string().trim().min(1).max(60),
  duration: z.string().trim().min(1).max(60),
  description: z.string().trim().min(30).max(5000),
  requirements: z.array(z.string().trim().min(2).max(180)).max(15).default([]),
  skills: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  deadline: z.preprocess((value) => value === '' ? undefined : value, z.coerce.date().optional())
});

router.get('/', asyncRoute(async (req, res) => {
  const page = Math.max(1, Math.min(Number(req.query.page) || 1, 1000));
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 12, 50));
  const filter = { status: 'open' };
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.workMode) filter.workMode = String(req.query.workMode);
  if (req.query.type) filter.type = String(req.query.type);
  if (req.query.location) {
    const location = String(req.query.location).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.location = { $regex: location, $options: 'i' };
  }
  const search = String(req.query.search || '').trim().slice(0, 100);
  if (search) filter.$text = { $search: search };
  const sort = req.query.sort === 'recent' ? { createdAt: -1 } :
    search ? { score: { $meta: 'textScore' } } : { featured: -1, createdAt: -1 };

  const [jobs, total] = await Promise.all([
    Job.find(filter).populate('employer', 'company').sort(sort)
      .skip((page - 1) * limit).limit(limit).lean(),
    Job.countDocuments(filter)
  ]);
  res.json({ jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.get('/mine', authenticate, requireRole('employer'), asyncRoute(async (req, res) => {
  const jobs = await Job.find({ employer: req.user.id }).sort({ createdAt: -1 }).lean();
  const ids = jobs.map((job) => job._id);
  const counts = await Application.aggregate([
    { $match: { job: { $in: ids } } },
    { $group: { _id: '$job', count: { $sum: 1 } } }
  ]);
  const countByJob = new Map(counts.map(({ _id, count }) => [_id.toString(), count]));
  res.json({ jobs: jobs.map((job) => ({ ...job, applicationCount: countByJob.get(job._id.toString()) || 0 })) });
}));

router.get('/:id', asyncRoute(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, status: 'open' }).populate('employer', 'company name').lean();
  if (!job) return res.status(404).json({ message: 'This opportunity is no longer available.' });
  return res.json({ job });
}));

router.post('/', authenticate, requireRole('employer'), asyncRoute(async (req, res) => {
  const data = validate(jobSchema, req.body);
  const job = await Job.create({ ...data, employer: req.user.id, company: req.user.company });
  res.status(201).json({ job });
}));

router.patch('/:id/status', authenticate, requireRole('employer'), asyncRoute(async (req, res) => {
  const data = validate(z.object({ status: z.enum(['open', 'closed']) }), req.body);
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, employer: req.user.id },
    { status: data.status },
    { new: true, runValidators: true }
  );
  if (!job) return res.status(404).json({ message: 'Job not found or you do not own it.' });
  return res.json({ job });
}));

router.get('/:id/applications', authenticate, requireRole('employer'), asyncRoute(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, employer: req.user.id });
  if (!job) return res.status(404).json({ message: 'Job not found or you do not own it.' });
  const applications = await Application.find({ job: job.id })
    .populate('student', 'name email school major graduationYear')
    .sort({ createdAt: -1 }).lean();
  res.json({ applications });
}));

module.exports = router;
