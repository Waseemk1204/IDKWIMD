import mongoose from 'mongoose';
import { config } from '../config';
import { CommunityPost } from '../models/CommunityPost';
import User from '../models/User';

// Sample community posts data
const samplePosts = [
  {
    title: 'Tips for freelancers working remotely',
    content: `Working remotely as a freelancer can be challenging. Here are some tips that have helped me stay productive and maintain a work-life balance:

1. **Create a dedicated workspace**: Even if it's just a corner of your room, having a designated area for work helps you get into the right mindset.

2. **Establish a routine**: Set regular working hours and stick to them. This helps separate work time from personal time.

3. **Take breaks**: Regular short breaks improve productivity. I follow the Pomodoro technique - 25 minutes of focused work followed by a 5-minute break.

4. **Stay connected**: Remote work can be isolating. Make an effort to connect with other professionals through online communities or virtual meetups.

5. **Track your time**: Use time-tracking tools to understand how you're spending your working hours and to ensure you're billing clients correctly.

What strategies have worked for you? I'd love to hear your experiences!`,
    tags: ['Remote Work', 'Freelancing', 'Productivity']
  },
  {
    title: 'How to find reliable part-time talent',
    content: `As an employer, I have learned a lot about finding and retaining quality part‑time talent. The key is to establish clear expectations and communication channels.

Here are some strategies that have worked well for our company:

**Clear Job Descriptions**: Be specific about what you need, when you need it, and what success looks like.

**Flexible Scheduling**: Part-time workers often have other commitments. Being flexible with scheduling can help you attract better talent.

**Regular Check-ins**: Weekly or bi-weekly check-ins help ensure everyone is on the same page and can address issues early.

**Fair Compensation**: Pay competitively for the skills and experience you're seeking.

**Growth Opportunities**: Even part-time workers want to grow. Offer training, skill development, or advancement opportunities.

What has been your experience with hiring part-time talent?`,
    tags: ['Hiring', 'Management', 'Best Practices']
  },
  {
    title: 'Payment dispute resolution - My experience',
    content: `I recently had a payment dispute with a client that was resolved through the platform's mediation. Here's how the process worked and what I learned:

**The Situation**: A client refused to pay for work that was completed according to the original agreement, claiming the quality wasn't up to their standards.

**The Process**: 
1. I submitted a dispute through the platform
2. The platform's mediation team reviewed the case
3. Both parties provided evidence and documentation
4. A resolution was reached within 5 business days

**The Outcome**: The client agreed to pay 80% of the original amount, which I accepted as fair given the circumstances.

**Key Takeaways**:
- Always document your work and communications
- Keep detailed records of agreements and changes
- Don't be afraid to use dispute resolution when needed
- Be open to compromise for a fair resolution

Has anyone else had experience with payment disputes? How did you handle them?`,
    tags: ['Disputes', 'Payments', 'Advice']
  },
  {
    title: 'Announcing our company flexible work policy',
    content: `We are excited to share that our company is now offering more flexible work arrangements for all employees. This includes part‑time options and remote work possibilities.

**New Policy Highlights**:
- Flexible working hours (core hours: 10 AM - 3 PM)
- Remote work up to 3 days per week
- Part-time positions available for most roles
- Compressed work weeks (4 days, 10 hours each)
- Job sharing opportunities

**Benefits We've Seen**:
- Increased employee satisfaction
- Better work-life balance
- Reduced turnover
- Higher productivity during working hours

We believe this approach helps us attract and retain top talent while supporting our team's diverse needs.

What flexible work arrangements does your company offer?`,
    tags: ['Company News', 'Flexible Work', 'Remote Work']
  },
  {
    title: 'Building a strong professional network as a freelancer',
    content: `Networking is crucial for freelancers, but it can be challenging when you're working independently. Here are some strategies that have helped me build meaningful professional relationships:

**Online Communities**: Join relevant Facebook groups, LinkedIn communities, and Slack channels in your industry.

**Attend Virtual Events**: Many conferences and meetups have moved online, making them more accessible.

**Collaborate with Other Freelancers**: Partner with other freelancers on projects to expand your network.

**Maintain Relationships**: Keep in touch with past clients and colleagues. A simple check-in can lead to new opportunities.

**Share Your Knowledge**: Write blog posts, create tutorials, or speak at events to establish yourself as an expert.

**Be Genuine**: Focus on building real relationships, not just collecting contacts.

What networking strategies have worked best for you?`,
    tags: ['Networking', 'Freelancing', 'Career Growth']
  }
];

async function populateCommunityPosts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a sample user to be the author (or create one if none exists)
    let author = await User.findOne();
    if (!author) {
      console.log('No users found. Please create a user first.');
      return;
    }

    // Clear existing community posts
    await CommunityPost.deleteMany({});
    console.log('Cleared existing community posts');

    // Create sample posts
    const posts = await Promise.all(
      samplePosts.map(async (postData) => {
        const post = new CommunityPost({
          ...postData,
          author: author._id,
          likes: Math.floor(Math.random() * 50) + 5, // Random likes between 5-55
          views: Math.floor(Math.random() * 200) + 20, // Random views between 20-220
          status: 'active'
        });
        return await post.save();
      })
    );

    console.log(`Created ${posts.length} community posts`);
    console.log('Community posts populated successfully!');

  } catch (error) {
    console.error('Error populating community posts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
populateCommunityPosts();
