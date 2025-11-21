import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Job from '../models/Job';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const companies = [
  'TechCorp India', 'Digital Solutions Pvt Ltd', 'StartupHub', 'Innovation Labs',
  'WebWorks', 'CodeCraft', 'DesignStudio', 'MarketMinds', 'SalesPro',
  'ContentKing', 'DataDriven', 'CloudNine Technologies', 'Byte Solutions',
  'PixelPerfect', 'AgileWorks', 'FutureNow', 'BrightIdeas', 'SmartSystems',
  'NextGen Solutions', 'CreativeHub', 'TechVentures', 'Digital Dynamics',
  'Innovative Minds', 'Pro Services', 'Elite Solutions', 'Prime Tech',
  'Global Connect', 'Urban Works', 'Metro Solutions', 'City Services',
  'Rapid Growth', 'Success Partners', 'Growth Catalyst', 'Venture Lab',
  'Impact Makers', 'Value Creators', 'Quality First', 'Excellence Corp',
  'Premier Solutions', 'Top Tier Services', 'Leadership Group', 'Strategic Partners',
  'Business Builders', 'Market Leaders', 'Industry Experts', 'Professional Services',
  'Consulting Group', 'Advisory Firm', 'Expert Solutions', 'Knowledge Partners'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad',
  'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali',
  'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar',
  'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
  'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh',
  'Guwahati', 'Solapur', 'Hubli-Dharwad', 'Mysore'
];

const categories = [
  'IT', 'Marketing', 'Sales', 'Design', 'Content', 'Customer Service',
  'Data', 'Finance', 'Education', 'Healthcare'
] as const;

type Category = typeof categories[number];

const skills: Record<Category, string[]> = {
  IT: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js', 'TypeScript', 'PHP', 'Ruby', 'C++', 'Swift', 'Kotlin', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git'],
  Marketing: ['Digital Marketing', 'SEO', 'SEM', 'Social Media', 'Content Strategy', 'Google Analytics', 'Facebook Ads', 'Email Marketing', 'Brand Management', 'Market Research', 'Copywriting', 'Campaign Management'],
  Sales: ['B2B Sales', 'B2C Sales', 'Cold Calling', 'Lead Generation', 'CRM', 'Salesforce', 'Negotiation', 'Client Relations', 'Territory Management', 'Account Management'],
  Design: ['Adobe Photoshop', 'Illustrator', 'Figma', 'Sketch', 'Adobe XD', 'UI/UX', 'Graphic Design', 'Web Design', 'Typography', 'Branding', 'Prototyping', 'Wireframing'],
  Content: ['Content Writing', 'Copywriting', 'SEO Writing', 'Technical Writing', 'Creative Writing', 'Editing', 'Proofreading', 'WordPress', 'Blog Writing', 'Social Media Content'],
  'Customer Service': ['Communication', 'Problem Solving', 'CRM Software', 'Chat Support', 'Email Support', 'Phone Support', 'Customer Relations', 'Conflict Resolution'],
  Data: ['Excel', 'SQL', 'Python', 'R', 'Tableau', 'Power BI', 'Data Analysis', 'Statistics', 'Machine Learning', 'Data Visualization', 'Big Data', 'ETL'],
  Finance: ['Accounting', 'Excel', 'QuickBooks', 'Financial Analysis', 'Bookkeeping', 'Tax Preparation', 'Auditing', 'Budgeting', 'Financial Reporting', 'GST'],
  Education: ['Teaching', 'Tutoring', 'Curriculum Development', 'Lesson Planning', 'Student Assessment', 'Online Teaching', 'Subject Matter Expertise', 'Communication Skills'],
  Healthcare: ['Patient Care', 'Medical Records', 'Healthcare IT', 'Medical Billing', 'HIPAA Compliance', 'EMR Systems', 'Healthcare Administration', 'Medical Coding']
};

const jobTitles: Record<Category, string[]> = {
  IT: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile App Developer', 'DevOps Engineer', 'QA Engineer', 'UI Developer', 'Software Engineer', 'Web Developer', 'Systems Administrator'],
  Marketing: ['Digital Marketing Specialist', 'SEO Analyst', 'Social Media Manager', 'Marketing Coordinator', 'Content Marketer', 'Brand Manager', 'Marketing Assistant', 'Growth Hacker', 'Email Marketing Specialist'],
  Sales: ['Sales Representative', 'Business Development Executive', 'Inside Sales Representative', 'Account Executive', 'Sales Associate', 'Territory Manager', 'Lead Generation Specialist', 'Sales Coordinator'],
  Design: ['Graphic Designer', 'UI/UX Designer', 'Web Designer', 'Visual Designer', 'Product Designer', 'Brand Designer', 'Motion Graphics Designer', 'Interaction Designer'],
  Content: ['Content Writer', 'Copywriter', 'Technical Writer', 'Content Editor', 'Blog Writer', 'Social Media Writer', 'Content Strategist', 'Freelance Writer'],
  'Customer Service': ['Customer Support Representative', 'Customer Service Associate', 'Help Desk Support', 'Client Relations Specialist', 'Customer Success Associate', 'Technical Support Representative'],
  Data: ['Data Analyst', 'Business Analyst', 'Data Entry Specialist', 'Research Analyst', 'Statistical Analyst', 'Data Visualization Specialist', 'BI Analyst'],
  Finance: ['Accounts Assistant', 'Financial Analyst', 'Bookkeeper', 'Tax Associate', 'Audit Associate', 'Finance Coordinator', 'Accounting Clerk'],
  Education: ['Online Tutor', 'Subject Matter Expert', 'Content Developer', 'Curriculum Designer', 'Educational Consultant', 'Teaching Assistant', 'Test Prep Instructor'],
  Healthcare: ['Medical Records Specialist', 'Healthcare Data Analyst', 'Medical Billing Specialist', 'Healthcare IT Support', 'Patient Care Coordinator', 'Medical Transcriptionist']
};

// Map experience into model enum: 'entry' | 'mid' | 'senior'
const experienceLevels = ['entry', 'mid', 'senior'] as const;
const jobTypes = ['part-time', 'contract', 'freelance', 'internship'];

const descriptions = [
  'We are seeking a motivated individual to join our team.',
  'Exciting opportunity to work with cutting-edge technologies.',
  'Join a fast-growing company with great work culture.',
  'Work on challenging projects with experienced professionals.',
  'Flexible working hours and remote work options available.',
  'Great learning opportunity for students and recent graduates.',
  'Be part of an innovative team driving digital transformation.',
  'Collaborative environment with opportunities for growth.',
  'Work on impactful projects that make a difference.',
  'Join our team and help us deliver excellence to our clients.'
];

const responsibilities = [
  'Collaborate with cross-functional teams',
  'Meet project deadlines and deliverables',
  'Maintain high quality standards',
  'Communicate effectively with team members',
  'Contribute to team meetings and brainstorming sessions',
  'Learn new skills and technologies',
  'Document work and processes',
  'Support senior team members'
];

const requirements = [
  'Strong communication skills',
  'Attention to detail',
  'Time management abilities',
  'Team player attitude',
  'Willingness to learn',
  'Basic computer skills',
  'Problem-solving mindset',
  'Reliable internet connection (for remote work)'
];

const generateRandomJob = (employerId: string) => {
  const category: Category = categories[Math.floor(Math.random() * categories.length)];
  const title = jobTitles[category][Math.floor(Math.random() * jobTitles[category].length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const location = cities[Math.floor(Math.random() * cities.length)];
  const experienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
  const isRemote = Math.random() > 0.6; // 40% remote jobs

  // Generate salary based on experience
  let minSalary, maxSalary;
  switch (experienceLevel) {
    case 'entry':
      minSalary = 50 + Math.floor(Math.random() * 50);
      maxSalary = minSalary + 50 + Math.floor(Math.random() * 50);
      break;
    case 'mid':
      minSalary = 150 + Math.floor(Math.random() * 100);
      maxSalary = minSalary + 100 + Math.floor(Math.random() * 100);
      break;
    case 'senior':
    default:
      minSalary = 300 + Math.floor(Math.random() * 150);
      maxSalary = minSalary + 150 + Math.floor(Math.random() * 200);
  }

  // Select 3-5 relevant skills
  const categorySkills = skills[category];
  const numSkills = 3 + Math.floor(Math.random() * 3);
  const selectedSkills = [];
  const shuffled = [...categorySkills].sort(() => 0.5 - Math.random());
  for (let i = 0; i < numSkills && i < shuffled.length; i++) {
    selectedSkills.push(shuffled[i]);
  }

  const description = descriptions[Math.floor(Math.random() * descriptions.length)];

  // Select 3-5 responsibilities
  const selectedResponsibilities = [];
  const shuffledResp = [...responsibilities].sort(() => 0.5 - Math.random());
  for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
    selectedResponsibilities.push(shuffledResp[i]);
  }

  // Select 3-5 requirements
  const selectedRequirements = [];
  const shuffledReq = [...requirements].sort(() => 0.5 - Math.random());
  for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
    selectedRequirements.push(shuffledReq[i]);
  }

  // Random posted date within last 30 days
  const daysAgo = Math.floor(Math.random() * 30);
  const postedDate = new Date();
  postedDate.setDate(postedDate.getDate() - daysAgo);

  // Generate hours per week string (e.g., "10-20")
  const minHours = [5, 10, 15, 20][Math.floor(Math.random() * 4)];
  const maxHours = minHours + [5, 10, 15][Math.floor(Math.random() * 3)];

  return {
    title,
    description: `${description} ${title} position available at ${company}.`,
    company,
    location: isRemote ? 'Remote' : location,
    minHourlyRate: minSalary,
    maxHourlyRate: maxSalary,
    hourlyRate: Math.floor((minSalary + maxSalary) / 2),
    category,
    // type is not part of the schema, omit
    experienceLevel,
    skills: selectedSkills,
    responsibilities: selectedResponsibilities,
    requirements: selectedRequirements,
    isRemote,
    hoursPerWeek: `${minHours}-${maxHours}`,
    duration: ['1 month', '2 months', '3 months', '6 months', 'Ongoing'][Math.floor(Math.random() * 5)],
    urgency: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    status: 'active',
    employer: new mongoose.Types.ObjectId(employerId),
    postedDate,
    // fields not in schema removed
  };
};

const seedJobs = async (count: number = 250) => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/parttimepay';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find an employer user (or use admin as employer)
    let employer = await User.findOne({ role: 'employer' });

    if (!employer) {
      console.log('⚠️  No employer found. Creating a test employer...');
      employer = await User.create({
        email: 'test.employer@parttimepay.com',
        username: 'testemployer',
        fullName: 'Test Employer',
        password: 'Test@123456', // This will be hashed by the pre-save hook
        role: 'employer',
        isVerified: true,
        isActive: true,
        companyInfo: {
          companyName: 'Test Company',
          industry: 'Technology',
          companySize: '50-100'
        }
      });
      console.log('✅ Test employer created');
    }

    // Clear existing jobs (optional - comment out if you want to keep existing jobs)
    // await Job.deleteMany({});
    // console.log('🗑️  Cleared existing jobs');

    // Generate and insert jobs
    console.log(`📝 Generating ${count} jobs...`);
    const jobs = [];
    for (let i = 0; i < count; i++) {
      jobs.push(generateRandomJob(employer._id.toString()));
    }

    await Job.insertMany(jobs);
    console.log(`✅ Successfully seeded ${count} jobs`);

    // Display summary
    const summary = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Summary by category:');
    summary.forEach(item => {
      console.log(`   ${item._id}: ${item.count} jobs`);
    });

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`\n🔐 Test Employer Credentials:`);
    console.log(`   Email: test.employer@parttimepay.com`);
    console.log(`   Password: Test@123456`);
    console.log(`   (You can use this account to manage the seeded jobs)\n`);

  } catch (error) {
    console.error('❌ Error seeding jobs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// Get count from command line argument or use default
const count = process.argv[2] ? parseInt(process.argv[2]) : 250;

if (isNaN(count) || count <= 0) {
  console.error('❌ Invalid count. Please provide a positive number.');
  process.exit(1);
}

seedJobs(count);

