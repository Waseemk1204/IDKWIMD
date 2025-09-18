export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  authorBio: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  thumbnail: string;
  featured: boolean;
  views: number;
  likes: number;
  comments: number;
}

// Unified blog data source - in production, this would come from an API
export const BLOGS_DATA: BlogPost[] = [
  {
    id: '1',
    title: 'Top 5 Side Hustles for College Students in 2025',
    excerpt: 'Discover the most profitable and flexible side hustles that perfectly complement your college schedule and help build your career.',
    content: `
      <p>The landscape of part-time work has evolved dramatically in recent years, offering college students unprecedented opportunities to earn money while building valuable skills. Here are the top 5 side hustles that are perfect for students in 2025:</p>

      <h2>1. Freelance Content Creation</h2>
      <p>With the rise of digital marketing, businesses are constantly seeking fresh content. Whether it's writing blog posts, creating social media content, or designing graphics, freelance content creation offers flexible hours and competitive pay rates.</p>
      
      <h3>Why it's perfect for students:</h3>
      <ul>
        <li>Work from anywhere with just a laptop</li>
        <li>Build a portfolio while earning money</li>
        <li>Develop skills in high demand</li>
        <li>Set your own schedule around classes</li>
      </ul>

      <h2>2. Virtual Tutoring</h2>
      <p>The online education boom has created massive opportunities for virtual tutoring. Whether you're helping high school students with math or teaching a foreign language, virtual tutoring can be incredibly rewarding and profitable.</p>

      <h2>3. Social Media Management</h2>
      <p>Small businesses often struggle with maintaining an active social media presence. As a student, you're already familiar with the latest platforms and trends, making you the perfect candidate for social media management roles.</p>

      <h2>4. E-commerce and Dropshipping</h2>
      <p>Starting an online store has never been easier. With platforms like Shopify and WooCommerce, students can launch their own e-commerce businesses with minimal upfront investment.</p>

      <h2>5. Online Course Creation</h2>
      <p>If you have expertise in a particular subject, creating and selling online courses can be a lucrative side hustle. Platforms like Udemy and Teachable make it easy to reach a global audience.</p>

      <h2>Getting Started</h2>
      <p>To succeed in any of these side hustles, start by identifying your strengths and interests. Build a strong online presence, create a portfolio, and don't be afraid to start small. Remember, every successful entrepreneur started somewhere!</p>
    `,
    author: 'Priya Sharma',
    authorRole: 'Career Advisor',
    authorBio: 'Priya is a career advisor with over 8 years of experience helping students and young professionals navigate the job market. She specializes in remote work opportunities and career development.',
    publishDate: '2025-01-15',
    readTime: '8 min read',
    category: 'Career Tips',
    tags: ['students', 'side-hustle', 'income', 'flexibility'],
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
    featured: true,
    views: 2847,
    likes: 156,
    comments: 23
  },
  {
    id: '2',
    title: 'Balancing a 20-Hour Part-Time Job with Full-Time Studies',
    excerpt: 'Master the art of time management and excel in both academics and work with proven strategies from successful student workers.',
    content: `
      <p>Balancing work and studies can seem overwhelming, but with the right strategies, you can excel in both areas. Here's how to manage a 20-hour part-time job while maintaining academic excellence:</p>

      <h2>1. Create a Detailed Schedule</h2>
      <p>Time management is crucial when juggling work and studies. Use a digital calendar to block out specific times for classes, study sessions, work shifts, and personal time.</p>

      <h2>2. Prioritize Your Tasks</h2>
      <p>Not all tasks are created equal. Use the Eisenhower Matrix to categorize your tasks by urgency and importance, focusing on what truly matters.</p>

      <h2>3. Communicate with Your Employer</h2>
      <p>Be upfront about your academic commitments. Most employers appreciate students who are honest about their availability and will work with you to create a flexible schedule.</p>

      <h2>4. Use Your Commute Wisely</h2>
      <p>Turn your commute into productive time by listening to educational podcasts, reviewing notes, or catching up on reading assignments.</p>

      <h2>5. Take Care of Your Health</h2>
      <p>Don't sacrifice your physical and mental health. Ensure you get enough sleep, eat well, and take breaks when needed.</p>
    `,
    author: 'Rajesh Kumar',
    authorRole: 'Student Success Coach',
    authorBio: 'Rajesh is a student success coach who has helped over 500 students balance work and studies effectively. He holds a Master\'s in Educational Psychology.',
    publishDate: '2025-01-12',
    readTime: '6 min read',
    category: 'Productivity',
    tags: ['time-management', 'studies', 'work-life-balance'],
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
    featured: false,
    views: 1923,
    likes: 89,
    comments: 15
  },
  {
    id: '3',
    title: 'Why Employers Benefit from Hiring Skilled Part-Timers',
    excerpt: 'Explore the advantages of hiring part-time workers and how it can boost your business productivity and flexibility.',
    content: `
      <p>In today's dynamic business environment, hiring skilled part-time workers offers numerous advantages that can significantly boost your company's productivity and flexibility.</p>

      <h2>Cost-Effective Solution</h2>
      <p>Part-time workers typically cost less than full-time employees in terms of benefits, office space, and equipment. This allows businesses to allocate resources more efficiently.</p>

      <h2>Access to Specialized Skills</h2>
      <p>Part-time workers often bring specialized skills and fresh perspectives that can enhance your team's capabilities without the long-term commitment of a full-time hire.</p>

      <h2>Increased Flexibility</h2>
      <p>Part-time workers provide the flexibility to scale your workforce up or down based on project demands and seasonal fluctuations.</p>

      <h2>Higher Productivity</h2>
      <p>Studies show that part-time workers often have higher productivity rates per hour worked, as they're more focused and motivated during their working hours.</p>
    `,
    author: 'Lisa Wang',
    authorRole: 'HR Specialist',
    authorBio: 'Lisa is an HR specialist with 12 years of experience in talent acquisition and workforce management. She has helped numerous companies optimize their hiring strategies.',
    publishDate: '2025-01-10',
    readTime: '5 min read',
    category: 'Employer Insights',
    tags: ['hiring', 'employers', 'productivity', 'flexibility'],
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    featured: false,
    views: 1654,
    likes: 67,
    comments: 12
  },
  {
    id: '4',
    title: 'Building Essential Skills for Remote Work Success',
    excerpt: 'Develop the key skills needed to thrive in remote work environments and stand out to potential employers.',
    content: `
      <p>Remote work has become the new norm, and developing the right skills is crucial for success in this environment. Here are the essential skills every remote worker should master:</p>

      <h2>1. Digital Communication</h2>
      <p>Effective written and verbal communication through digital channels is essential. Learn to be clear, concise, and professional in all your communications.</p>

      <h2>2. Time Management</h2>
      <p>Without the structure of an office environment, self-discipline and time management become critical skills for remote workers.</p>

      <h2>3. Technical Proficiency</h2>
      <p>Familiarize yourself with common remote work tools like Slack, Zoom, Trello, and project management software.</p>

      <h2>4. Self-Motivation</h2>
      <p>Remote work requires a high level of self-motivation and the ability to work independently without constant supervision.</p>
    `,
    author: 'Sarah Johnson',
    authorRole: 'Remote Work Consultant',
    authorBio: 'Sarah is a remote work consultant who has helped over 200 professionals transition to remote work successfully. She is the author of "The Remote Worker\'s Guide to Success".',
    publishDate: '2025-01-08',
    readTime: '7 min read',
    category: 'Skill Building',
    tags: ['remote-work', 'skills', 'productivity', 'career-development'],
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
    featured: false,
    views: 1456,
    likes: 78,
    comments: 18
  },
  {
    id: '5',
    title: 'The Future of Part-Time Work: Trends to Watch in 2025',
    excerpt: 'Explore the emerging trends in part-time work and how they will shape the future of employment.',
    content: `
      <p>The part-time work landscape is evolving rapidly, with new trends emerging that will shape how we work in 2025 and beyond.</p>

      <h2>1. Gig Economy Expansion</h2>
      <p>The gig economy continues to grow, offering more opportunities for flexible, project-based work across various industries.</p>

      <h2>2. AI-Powered Job Matching</h2>
      <p>Artificial intelligence is revolutionizing how workers and employers find each other, making the job search process more efficient and personalized.</p>

      <h2>3. Skills-Based Hiring</h2>
      <p>Employers are increasingly focusing on skills rather than traditional qualifications, opening doors for self-taught professionals.</p>

      <h2>4. Hybrid Work Models</h2>
      <p>The future of work lies in hybrid models that combine the flexibility of remote work with the collaboration benefits of in-person interaction.</p>
    `,
    author: 'Michael Chen',
    authorRole: 'Workplace Trends Analyst',
    authorBio: 'Michael is a workplace trends analyst with a Ph.D. in Organizational Psychology. He has published numerous articles on the future of work and employment trends.',
    publishDate: '2025-01-05',
    readTime: '6 min read',
    category: 'Workplace Trends',
    tags: ['future-of-work', 'trends', 'gig-economy', 'technology'],
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop',
    featured: false,
    views: 1789,
    likes: 92,
    comments: 21
  },
  {
    id: '6',
    title: 'Remote Work Productivity: Tools and Tips for Success',
    excerpt: 'Maximize your productivity while working remotely with the best tools, techniques, and habits used by top performers.',
    content: `
      <p>Working remotely presents unique challenges, but with the right tools and techniques, you can achieve peak productivity from anywhere.</p>

      <h2>Essential Remote Work Tools</h2>
      <p>From communication platforms to project management software, having the right tools is crucial for remote work success.</p>

      <h2>Creating a Productive Workspace</h2>
      <p>Your physical environment significantly impacts your productivity. Learn how to set up an effective home office that promotes focus and creativity.</p>

      <h2>Time Management Techniques</h2>
      <p>Discover proven time management techniques that help remote workers stay organized and meet deadlines consistently.</p>

      <h2>Maintaining Work-Life Balance</h2>
      <p>One of the biggest challenges of remote work is maintaining boundaries between work and personal life. Learn strategies to create healthy separation.</p>
    `,
    author: 'Vikram Reddy',
    authorRole: 'Productivity Coach',
    authorBio: 'Vikram is a productivity coach who specializes in helping remote workers optimize their performance. He has worked with Fortune 500 companies and startups alike.',
    publishDate: '2025-01-03',
    readTime: '6 min read',
    category: 'Productivity',
    tags: ['remote-work', 'productivity', 'tools', 'success'],
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
    featured: false,
    views: 1634,
    likes: 74,
    comments: 16
  },
  {
    id: '7',
    title: 'How to Build a Strong Personal Brand as a Freelancer',
    excerpt: 'Learn the essential strategies for building a compelling personal brand that attracts high-quality clients and opportunities.',
    content: `
      <p>In today's competitive freelance market, having a strong personal brand is essential for standing out and attracting the right clients.</p>

      <h2>Define Your Unique Value Proposition</h2>
      <p>Identify what makes you different from other freelancers in your field and communicate this clearly to potential clients.</p>

      <h2>Create a Professional Online Presence</h2>
      <p>Your website, social media profiles, and portfolio should all reflect your professional brand and expertise.</p>

      <h2>Consistent Content Creation</h2>
      <p>Regularly creating valuable content helps establish you as an expert in your field and keeps you top-of-mind with potential clients.</p>

      <h2>Network Strategically</h2>
      <p>Building relationships with other professionals in your industry can lead to referrals and collaboration opportunities.</p>
    `,
    author: 'Emma Rodriguez',
    authorRole: 'Branding Expert',
    authorBio: 'Emma is a branding expert who has helped over 300 freelancers build successful personal brands. She is the founder of BrandBuild Academy.',
    publishDate: '2025-01-01',
    readTime: '8 min read',
    category: 'Skill Building',
    tags: ['personal-branding', 'freelancing', 'marketing', 'career-growth'],
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    featured: false,
    views: 1987,
    likes: 112,
    comments: 28
  },
  {
    id: '8',
    title: 'The Psychology of Successful Part-Time Workers',
    excerpt: 'Understand the mindset and psychological traits that contribute to success in part-time work environments.',
    content: `
      <p>Success in part-time work isn't just about skills and experience—it's also about having the right mindset and psychological approach.</p>

      <h2>Growth Mindset</h2>
      <p>Part-time workers with a growth mindset see challenges as opportunities to learn and improve, leading to better performance and career advancement.</p>

      <h2>Adaptability</h2>
      <p>The ability to adapt quickly to new environments, tasks, and team dynamics is crucial for part-time workers who often work in multiple settings.</p>

      <h2>Self-Motivation</h2>
      <p>Without constant supervision, part-time workers need strong self-motivation to stay productive and meet their goals.</p>

      <h2>Resilience</h2>
      <p>Dealing with rejection, uncertainty, and changing circumstances requires resilience and the ability to bounce back from setbacks.</p>
    `,
    author: 'Dr. Jennifer Park',
    authorRole: 'Industrial Psychologist',
    authorBio: 'Dr. Jennifer Park is an industrial psychologist specializing in workplace behavior and performance. She has conducted extensive research on part-time work dynamics.',
    publishDate: '2024-12-28',
    readTime: '7 min read',
    category: 'Workplace Trends',
    tags: ['psychology', 'mindset', 'success', 'part-time-work'],
    thumbnail: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=250&fit=crop',
    featured: false,
    views: 1234,
    likes: 56,
    comments: 14
  },
  {
    id: '9',
    title: 'Maximizing Earnings: Strategies for Part-Time Workers',
    excerpt: 'Discover proven strategies to increase your hourly rate and maximize your earnings as a part-time worker.',
    content: `
      <p>Maximizing your earnings as a part-time worker requires strategic thinking and continuous skill development. Here are proven strategies to increase your income:</p>

      <h2>1. Specialize in High-Demand Skills</h2>
      <p>Focus on developing skills that are in high demand and command premium rates, such as digital marketing, data analysis, or specialized technical skills.</p>

      <h2>2. Build a Strong Portfolio</h2>
      <p>A compelling portfolio showcasing your best work can justify higher rates and attract better clients.</p>

      <h2>3. Negotiate Confidently</h2>
      <p>Learn to negotiate your rates confidently based on your skills, experience, and the value you provide.</p>

      <h2>4. Diversify Your Income Streams</h2>
      <p>Don't rely on a single source of income. Consider multiple part-time roles or freelance projects to increase your overall earnings.</p>

      <h2>5. Invest in Continuous Learning</h2>
      <p>Stay updated with industry trends and continuously improve your skills to remain competitive and command higher rates.</p>
    `,
    author: 'David Kim',
    authorRole: 'Career Strategist',
    authorBio: 'David is a career strategist who has helped thousands of part-time workers increase their earnings. He is the author of "The Part-Time Professional\'s Guide to Higher Income".',
    publishDate: '2024-12-25',
    readTime: '9 min read',
    category: 'Career Tips',
    tags: ['earnings', 'income', 'strategy', 'career-growth'],
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    featured: false,
    views: 2156,
    likes: 134,
    comments: 31
  },
  {
    id: '10',
    title: 'Creating Work-Life Balance in Part-Time Employment',
    excerpt: 'Learn how to maintain a healthy work-life balance while managing multiple part-time roles and responsibilities.',
    content: `
      <p>Maintaining work-life balance as a part-time worker can be challenging, especially when juggling multiple roles. Here's how to create sustainable balance:</p>

      <h2>Set Clear Boundaries</h2>
      <p>Establish clear boundaries between work and personal time, and communicate these boundaries to employers and clients.</p>

      <h2>Prioritize Self-Care</h2>
      <p>Make time for activities that recharge you, whether it's exercise, hobbies, or spending time with loved ones.</p>

      <h2>Use Technology Wisely</h2>
      <p>Leverage technology to streamline your work processes, but don't let it consume your personal time.</p>

      <h2>Learn to Say No</h2>
      <p>It's okay to decline opportunities that don't align with your goals or would compromise your work-life balance.</p>

      <h2>Regular Review and Adjustment</h2>
      <p>Regularly assess your work-life balance and make adjustments as needed to maintain your well-being and productivity.</p>
    `,
    author: 'Maria Santos',
    authorRole: 'Wellness Coach',
    authorBio: 'Maria is a wellness coach specializing in work-life balance for part-time workers. She holds a Master\'s in Psychology and has helped hundreds of professionals achieve better balance.',
    publishDate: '2024-12-22',
    readTime: '6 min read',
    category: 'Productivity',
    tags: ['work-life-balance', 'wellness', 'self-care', 'productivity'],
    thumbnail: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=250&fit=crop',
    featured: false,
    views: 1678,
    likes: 89,
    comments: 19
  },
  {
    id: '11',
    title: 'The Gig Economy: Opportunities and Challenges',
    excerpt: 'Explore the growing gig economy, its opportunities for flexible work, and the challenges workers face in this evolving landscape.',
    content: `
      <p>The gig economy has transformed how people work, offering unprecedented flexibility but also presenting unique challenges.</p>

      <h2>Opportunities in the Gig Economy</h2>
      <p>The gig economy offers flexibility, variety, and the opportunity to work on projects that align with your interests and skills.</p>

      <h2>Challenges to Consider</h2>
      <p>Gig workers face challenges such as income instability, lack of benefits, and the need for constant self-promotion.</p>

      <h2>Building Financial Stability</h2>
      <p>Learn strategies for building financial stability in the gig economy, including emergency funds and retirement planning.</p>

      <h2>Protecting Your Rights</h2>
      <p>Understand your rights as a gig worker and how to protect yourself from exploitation and unfair practices.</p>
    `,
    author: 'Alex Thompson',
    authorRole: 'Gig Economy Researcher',
    authorBio: 'Alex is a researcher specializing in the gig economy and its impact on workers. He has published numerous studies on gig work trends and worker experiences.',
    publishDate: '2024-12-20',
    readTime: '8 min read',
    category: 'Workplace Trends',
    tags: ['gig-economy', 'flexible-work', 'challenges', 'opportunities'],
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
    featured: false,
    views: 1892,
    likes: 97,
    comments: 24
  },
  {
    id: '12',
    title: 'Networking Strategies for Part-Time Professionals',
    excerpt: 'Master the art of networking as a part-time worker to build valuable connections and advance your career.',
    content: `
      <p>Effective networking is crucial for part-time workers who need to build relationships across multiple employers and industries.</p>

      <h2>Online Networking</h2>
      <p>Leverage LinkedIn, professional forums, and industry-specific platforms to connect with peers and potential employers.</p>

      <h2>Industry Events and Conferences</h2>
      <p>Attend industry events, conferences, and meetups to meet people in person and build stronger relationships.</p>

      <h2>Informational Interviews</h2>
      <p>Conduct informational interviews to learn about different roles and companies while building your network.</p>

      <h2>Follow-Up and Relationship Maintenance</h2>
      <p>Learn how to follow up effectively and maintain relationships over time to build a strong professional network.</p>
    `,
    author: 'Rachel Green',
    authorRole: 'Networking Expert',
    authorBio: 'Rachel is a networking expert who has helped thousands of professionals build meaningful connections. She is the founder of ConnectPro, a networking consultancy.',
    publishDate: '2024-12-18',
    readTime: '7 min read',
    category: 'Skill Building',
    tags: ['networking', 'career-development', 'professional-relationships', 'growth'],
    thumbnail: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop',
    featured: false,
    views: 1456,
    likes: 73,
    comments: 17
  }
];

// Helper functions for filtering and sorting blogs
export const getBlogsByCategory = (category: string): BlogPost[] => {
  if (category === 'All') return BLOGS_DATA;
  return BLOGS_DATA.filter(blog => blog.category === category);
};

export const getFeaturedBlogs = (): BlogPost[] => {
  return BLOGS_DATA.filter(blog => blog.featured);
};

export const getRecentBlogs = (limit?: number): BlogPost[] => {
  const sorted = [...BLOGS_DATA].sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
};

export const getBlogById = (id: string): BlogPost | undefined => {
  return BLOGS_DATA.find(blog => blog.id === id);
};

export const searchBlogs = (query: string): BlogPost[] => {
  const lowercaseQuery = query.toLowerCase();
  return BLOGS_DATA.filter(blog => 
    blog.title.toLowerCase().includes(lowercaseQuery) ||
    blog.excerpt.toLowerCase().includes(lowercaseQuery) ||
    blog.content.toLowerCase().includes(lowercaseQuery) ||
    blog.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    blog.author.toLowerCase().includes(lowercaseQuery)
  );
};

export const getBlogsByAuthor = (author: string): BlogPost[] => {
  return BLOGS_DATA.filter(blog => 
    blog.author.toLowerCase().includes(author.toLowerCase())
  );
};

export const getBlogsByTag = (tag: string): BlogPost[] => {
  return BLOGS_DATA.filter(blog => 
    blog.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
};

export const sortBlogsByDate = (blogs: BlogPost[], order: 'asc' | 'desc' = 'desc'): BlogPost[] => {
  return [...blogs].sort((a, b) => {
    const dateA = new Date(a.publishDate).getTime();
    const dateB = new Date(b.publishDate).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

export const sortBlogsByViews = (blogs: BlogPost[], order: 'asc' | 'desc' = 'desc'): BlogPost[] => {
  return [...blogs].sort((a, b) => {
    return order === 'desc' ? b.views - a.views : a.views - b.views;
  });
};

export const sortBlogsByLikes = (blogs: BlogPost[], order: 'asc' | 'desc' = 'desc'): BlogPost[] => {
  return [...blogs].sort((a, b) => {
    return order === 'desc' ? b.likes - a.likes : a.likes - b.likes;
  });
};

// Get blogs for homepage (featured and recent)
export const getBlogsForHomepage = (limit: number = 3): BlogPost[] => {
  return getRecentBlogs(limit);
};

// Get blogs for main blogs page with filtering
export const getBlogsForBlogsPage = (filters?: {
  category?: string;
  search?: string;
  sortBy?: 'date' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
}): BlogPost[] => {
  let blogs = BLOGS_DATA;
  
  if (filters?.category && filters.category !== 'All') {
    blogs = getBlogsByCategory(filters.category);
  }
  
  if (filters?.search) {
    blogs = searchBlogs(filters.search);
  }
  
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'date':
        blogs = sortBlogsByDate(blogs, filters.sortOrder);
        break;
      case 'views':
        blogs = sortBlogsByViews(blogs, filters.sortOrder);
        break;
      case 'likes':
        blogs = sortBlogsByLikes(blogs, filters.sortOrder);
        break;
    }
  }
  
  return blogs;
};

// Get related blogs (same category, excluding current blog)
export const getRelatedBlogs = (currentBlogId: string, limit: number = 3): BlogPost[] => {
  const currentBlog = getBlogById(currentBlogId);
  if (!currentBlog) return [];
  
  return BLOGS_DATA
    .filter(blog => blog.id !== currentBlogId && blog.category === currentBlog.category)
    .slice(0, limit);
};

// Get blog categories with counts
export const getBlogCategories = (): Array<{ name: string; count: number }> => {
  const categories = ['All', 'Career Tips', 'Productivity', 'Skill Building', 'Workplace Trends', 'Employer Insights'];
  
  return categories.map(category => ({
    name: category,
    count: category === 'All' ? BLOGS_DATA.length : getBlogsByCategory(category).length
  }));
};

// Format date for display
export const formatBlogDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format views count
export const formatBlogViews = (views: number): string => {
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k views`;
  }
  return `${views} views`;
};
