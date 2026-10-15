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
  },
  {
    title: 'Frontend Developer Intern',
    company: 'Juniper Labs',
    companyLogo: 'J',
    location: 'Remote, United States',
    workMode: 'Remote',
    type: 'Internship',
    category: 'Engineering',
    pay: '$30–36 / hr',
    duration: '12 weeks',
    description: 'Build accessible web experiences for a growing product team. Work with designers and engineers to deliver user-facing features and improve performance.',
    requirements: ['Coursework or project experience in web development', 'Familiarity with JavaScript and component-based UI'],
    skills: ['JavaScript', 'React', 'Accessibility']
  },
  {
    title: 'Business Intelligence Co-op',
    company: 'Northstar Analytics',
    companyLogo: 'N',
    location: 'Boston, MA',
    workMode: 'Hybrid',
    type: 'Co-op',
    category: 'Data & Analytics',
    pay: '$28–34 / hr',
    duration: '6 months',
    description: 'Help teams make informed decisions by preparing clean datasets, building dashboards, and explaining trends to business partners.',
    requirements: ['Currently pursuing a degree in analytics, business, or a related field', 'Basic SQL and spreadsheet experience'],
    skills: ['SQL', 'Data visualization', 'Excel']
  },
  {
    title: 'UX Research Intern',
    company: 'Cedar & Finch',
    companyLogo: 'C',
    location: 'Chicago, IL',
    workMode: 'Hybrid',
    type: 'Internship',
    category: 'Design',
    pay: '$26–32 / hr',
    duration: '10 weeks',
    description: 'Support research studies that help the team understand customer needs. Assist with interviews, usability sessions, and communicating findings.',
    requirements: ['Interest in human-centered design or research', 'Clear written and verbal communication'],
    skills: ['User research', 'Usability testing', 'Synthesis']
  },
  {
    title: 'Cybersecurity Analyst Intern',
    company: 'Harborlight Security',
    companyLogo: 'H',
    location: 'Washington, DC',
    workMode: 'On-site',
    type: 'Internship',
    category: 'Engineering',
    pay: '$29–35 / hr',
    duration: '12 weeks',
    description: 'Learn how a security operations team monitors systems, investigates alerts, and documents practical ways to improve security posture.',
    requirements: ['Coursework in cybersecurity, computer science, or IT', 'Interest in networking and security fundamentals'],
    skills: ['Networking', 'Linux', 'Security analysis']
  },
  {
    title: 'People & Culture Co-op',
    company: 'Maple Works',
    companyLogo: 'M',
    location: 'Remote, United States',
    workMode: 'Remote',
    type: 'Co-op',
    category: 'People & Culture',
    pay: '$24–29 / hr',
    duration: '6 months',
    description: 'Contribute to employee onboarding and internal programs while helping improve the systems that make a distributed workplace run smoothly.',
    requirements: ['Strong organization and communication skills', 'Interest in human resources or operations'],
    skills: ['Communication', 'Coordination', 'Documentation']
  },
  {
    title: 'Content Marketing Intern',
    company: 'Brightpath Learning',
    companyLogo: 'B',
    location: 'Austin, TX',
    workMode: 'Hybrid',
    type: 'Internship',
    category: 'Marketing',
    pay: '$23–28 / hr',
    duration: '10 weeks',
    description: 'Create clear, useful content for learners and educators. Collaborate on editorial planning, audience research, and campaign reporting.',
    requirements: ['Interest in writing, communications, or marketing', 'Writing samples from coursework or projects'],
    skills: ['Writing', 'Content strategy', 'Analytics']
  },
  {
    title: 'Junior Software Developer',
    company: 'Orbit Civic Tech',
    companyLogo: 'O',
    location: 'Denver, CO',
    workMode: 'On-site',
    type: 'Graduate',
    category: 'Engineering',
    pay: '$72,000–82,000 / year',
    duration: 'Full-time',
    description: 'Join a small engineering team building reliable digital services for communities. Contribute to implementation, testing, and code review with mentorship.',
    requirements: ['Recent degree in computer science or equivalent project experience', 'Familiarity with one modern programming language'],
    skills: ['JavaScript', 'Git', 'Testing']
  },
  {
    title: 'Operations Analyst Intern',
    company: 'Fieldstone Mobility',
    companyLogo: 'F',
    location: 'Seattle, WA',
    workMode: 'Hybrid',
    type: 'Internship',
    category: 'Operations',
    pay: '$27–33 / hr',
    duration: '12 weeks',
    description: 'Help improve day-to-day operations by mapping processes, analyzing performance data, and coordinating small cross-functional projects.',
    requirements: ['Pursuing a degree in business, operations, or a quantitative field', 'Comfortable working with spreadsheets and presenting findings'],
    skills: ['Process improvement', 'Excel', 'Project coordination']
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
  await Job.bulkWrite(listings.map((job) => ({
    updateOne: {
      filter: { employer: employer.id, title: job.title, company: job.company },
      update: { $set: { ...job, employer: employer.id } },
      upsert: true
    }
  })));
  console.log(`Seeded ${listings.length} sample opportunities. Demo employer: ${email}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
