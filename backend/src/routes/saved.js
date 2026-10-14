const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncRoute } = require('../utils/validation');

const router = express.Router();
router.use(authenticate, requireRole('student'));

router.get('/', asyncRoute(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'savedJobs',
    match: { status: 'open' },
    populate: { path: 'employer', select: 'company' }
  });
  res.json({ jobs: user.savedJobs });
}));

router.post('/:jobId', asyncRoute(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, status: 'open' });
  if (!job) return res.status(404).json({ message: 'This opportunity is no longer available.' });
  await User.updateOne({ _id: req.user.id }, { $addToSet: { savedJobs: job.id } });
  res.status(204).end();
}));

router.delete('/:jobId', asyncRoute(async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $pull: { savedJobs: req.params.jobId } });
  res.status(204).end();
}));

module.exports = router;
