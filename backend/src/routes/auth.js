const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const { authenticate, issueSession, clearSession } = require('../middleware/auth');
const { asyncRoute, validate } = require('../utils/validation');

const router = express.Router();
const registrationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(10, 'Password must be at least 10 characters.').max(128),
  role: z.enum(['student', 'employer']),
  school: z.string().trim().max(120).optional(),
  major: z.string().trim().max(100).optional(),
  graduationYear: z.preprocess((value) => value === '' ? undefined : value, z.coerce.number().int().min(2020).max(2100).optional()),
  company: z.string().trim().max(120).optional()
}).refine((data) => data.role !== 'employer' || Boolean(data.company), {
  message: 'Company name is required for employer accounts.',
  path: ['company']
});
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128)
});

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    school: user.school,
    major: user.major,
    graduationYear: user.graduationYear,
    company: user.company
  };
}

router.post('/register', asyncRoute(async (req, res) => {
  const data = validate(registrationSchema, req.body);
  const existing = await User.exists({ email: data.email.toLowerCase() });
  if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

  const user = await User.create({
    ...data,
    email: data.email.toLowerCase(),
    passwordHash: await bcrypt.hash(data.password, 12)
  });
  issueSession(res, user);
  return res.status(201).json({ user: publicUser(user) });
}));

router.post('/login', asyncRoute(async (req, res) => {
  const data = validate(loginSchema, req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }
  issueSession(res, user);
  return res.json({ user: publicUser(user) });
}));

router.post('/logout', (req, res) => {
  clearSession(res);
  res.status(204).end();
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
