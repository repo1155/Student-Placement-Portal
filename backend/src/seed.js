const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { config, validateConfig } = require('./config');
const User = require('./models/User');
const Job = require('./models/Job');

const listings = [
  {
    title: 'Product Design Intern',
    company: 'Figma',
    companyLogo: 'F',
    location: 'New York, NY',
    workMode: 'Hybrid',
    type: 'Internship',
    category: 'Design',
    pay: '$38–45 / hr',
    duration: '12 weeks',
    description: 'Join our product design team to make complex creative tools feel simple. You will partner with designers and engineers on real product work, from early research through polished interaction prototypes.',
    requirements: ['Currently pursuing a degree in design or a related field', 'Portfolio demonstrating interaction and visual design'],
    skills: ['Figma', 'Prototyping', 'User research'],
    featured: true
  },
  {
    title: 'Software Engineering Intern',
    company: 'Notion',
    companyLogo: 'N',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    type: 'Internship',
    category: 'Engineering',
    pay: '$55–65 / hr',
    duration: '12 weeks',
    description: 'Build thoughtful software that helps people do their best work. Interns own meaningful projects with support from a dedicated mentor and ship improvements used by millions of people.',
    requirements: ['Pursuing a degree in computer science or equivalent experience', 'Experience building web applications'],
    skills: ['React', 'TypeScript', 'APIs'],
    featured: true
  },
  {
    title: 'Marketing & Growth Intern',
    company: 'Headspace',
    companyLogo: 'H',
    location: 'Remote, United States',
    workMode: 'Remote',
    type: 'Internship',
    category: 'Marketing',
    pay: '$28–32 / hr',
    duration: '10 weeks',
    description: 'Help more people build healthier routines. Work alongside our growth team to research audiences, develop campaign concepts, and use data to learn what is resonating.',
    requirements: ['Interest in consumer brands and digital marketing', 'Strong written communication'],
    skills: ['Content', 'Analytics', 'Social media']
  },
  {
    title: 'Data Science Co-op',
    company: 'Duolingo',
    companyLogo: 'D',
    location: 'Pittsburgh, PA',
    workMode: 'On-site',
    type: 'Co-op',
    category: 'Data & Analytics',
    pay: '$34–40 / hr',
    duration: '6 months',
    description: 'Turn learning data into better experiences for millions of learners. Collaborate with product and engineering on experiments, models, and clear communication of results.',
    requirements: ['Coursework in statistics, data science, or a related discipline', 'Comfortable using SQL and Python'],
    skills: ['Python', 'SQL', 'Experimentation'],
    featured: true
  },
  {
    title: 'People Operations Intern',
    company: 'Airtable',
    companyLogo: 'A',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    type: 'Internship',
    category: 'People & Culture',
    pay: '$30–35 / hr',
    duration: '12 weeks',
    description: 'Create a warm and organized employee experience. Support projects across onboarding, internal events, and people programs while learning how a growing technology company operates.',
    requirements: ['Excellent organization and attention to detail', 'Enjoys making processes more welcoming'],
    skills: ['Communication', 'Operations', 'Project management']
  },
  {
    title: 'Finance Analyst Intern',
    company: 'Brex',
    companyLogo: 'B',
    location: 'New York, NY',
    workMode: 'Hybrid',
    type: 'Internship',
    category: 'Finance',
    pay: '$32–38 / hr',
    duration: '10 weeks',
    description: 'Help a modern finance team make better decisions. You will build useful analyses, work with cross-functional partners, and present findings that make a measurable impact.',
    requirements: ['Pursuing finance, economics, or a quantitative degree', 'Strong analytical and presentation skills'],
    skills: ['Excel', 'Financial modeling', 'Communication']
  }
];

async function seed() {
  validateConfig();
  await mongoose.connect(config.mongoUri);
  const email = 'demo@northstar.example';
  const employer = await User.findOneAndUpdate(
    { email },
    {
      name: 'Northstar Team',
      email,
      passwordHash: await bcrypt.hash('PlacementDemo2026!', 12),
      role: 'employer',
      company: 'Northstar'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await Job.deleteMany({ employer: employer.id });
  await Job.insertMany(listings.map((job) => ({ ...job, employer: employer.id })));
  console.log(`Seeded ${listings.length} sample opportunities. Demo employer: ${email}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
