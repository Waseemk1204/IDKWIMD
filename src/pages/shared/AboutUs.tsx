import React, { useEffect } from 'react';
import { CardContent, CardHeader, CardTitle, ElevatedCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VerifiedBadge, SecureBadge } from '../../components/ui/TrustBadge';
import { useAuth } from '../../hooks/useAuth';
import { 
  Shield, 
  CheckCircle, 
  Users, 
  Briefcase, 
  Star, 
  Award, 
  Target, 
  Heart,
  Zap,
  Globe,
  Clock,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Building2,
  GraduationCap
} from 'lucide-react';

export const AboutUs: React.FC = () => {
  const { user } = useAuth();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Verified Jobs',
      description: 'Every job posting is verified by our team to ensure legitimacy and quality.',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: DollarSign,
      title: 'Payment Security',
      description: 'Secure escrow system ensures payments are protected and released on time.',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Clock,
      title: 'Smart Timesheets',
      description: 'Digital timesheet system for accurate work tracking and transparent billing.',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Users,
      title: 'Trust Network',
      description: 'Rating and review system builds trust between employers and workers.',
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: MessageSquare,
      title: 'Community Hub',
      description: 'Connect with peers, share experiences, and grow your professional network.',
      color: 'text-pink-600 dark:text-pink-400'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Skills development and career guidance to help you advance professionally.',
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  const teamMembers = [
    {
      name: 'Mohammad Waseem Khan',
      role: 'Co-Founder & Team Lead',
      image: '/team/mohammad-waseem-khan.jpg',
      description: 'Engineer with a background in Robotics, leading vision, product, and strategy for PART-TIME PAY$.'
    },
    {
      name: 'Shubham Gohil',
      role: 'Co-Founder & Strategy Lead',
      image: '/team/shubham-gohil.jpg',
      description: 'Business graduate driving market research, revenue strategy, and scalable onboarding models.'
    },
    {
      name: 'Anmol Reddy',
      role: 'Co-Founder & Technical Lead',
      image: '/team/anmol-reddy.jpg',
      description: 'Computer Science engineer specializing in backend architecture and future-ready platform design.'
    },
    {
      name: 'Samruddha Bhalerao',
      role: 'Co-Founder & Technical Lead',
      image: '/team/samruddha-bhalerao.jpg',
      description: 'Computer Science engineer focused on full-stack development, APIs, and platform scalability.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Active Users', icon: Users },
    { number: '15,000+', label: 'Verified Jobs', icon: Briefcase },
    { number: '₹2.5 Cr+', label: 'Payments Processed', icon: DollarSign },
    { number: '95%', label: 'User Satisfaction', icon: Star }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 px-4 py-2 rounded-full">
          <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <span className="text-primary-700 dark:text-primary-300 font-medium">About PART-TIME PAY$</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white">
          Empowering India's
          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Future Workforce</span>
        </h1>
        
        <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          We're building India's most trusted platform for part-time work, connecting students and professionals 
          with verified opportunities while ensuring security, transparency, and career growth.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <ElevatedCard key={index} className="text-center p-6">
            <div className="flex justify-center mb-3">
              <stat.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {stat.number}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {stat.label}
            </div>
          </ElevatedCard>
        ))}
      </div>

      {/* Who We Are Section */}
      <ElevatedCard>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Heart className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <CardTitle size="lg">Who We Are</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            PART-TIME PAY$ is India's premier platform for structured part-time employment, designed specifically 
            for students, young professionals, and businesses seeking flexible talent solutions. Founded in 2024, 
            we recognized the gap between the growing demand for flexible work and the lack of trustworthy, 
            structured platforms to facilitate it.
          </p>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Our platform serves as a bridge between ambitious students looking to gain real-world experience 
            while earning, and forward-thinking businesses that need skilled, flexible workforce. We've built 
            comprehensive systems for verification, payment security, and professional development to ensure 
            every interaction on our platform is safe, transparent, and mutually beneficial.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Badge variant="primary" className="flex items-center space-x-1">
              <GraduationCap className="h-3 w-3" />
              <span>Student-Focused</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Building2 className="h-3 w-3" />
              <span>Business-Friendly</span>
            </Badge>
            <Badge variant="success" className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Secure Platform</span>
            </Badge>
          </div>
        </CardContent>
      </ElevatedCard>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6">
        <ElevatedCard>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle size="lg">Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              To revolutionize part-time work in India by creating a structured, safe, and career-friendly 
              ecosystem that empowers students and professionals to build their futures while helping 
              businesses access skilled, flexible talent.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Structured work opportunities</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Career development focus</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Safe and secure platform</span>
              </div>
            </div>
          </CardContent>
        </ElevatedCard>

        <ElevatedCard>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle size="lg">Our Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              To build India's most trusted network for flexible employment, where every student has access 
              to meaningful work opportunities, every professional can grow their skills, and every business 
              can find the talent they need to thrive.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Most trusted platform</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Nationwide network</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Mutual growth ecosystem</span>
              </div>
            </div>
          </CardContent>
        </ElevatedCard>
      </div>

      {/* What Makes Us Different */}
      <ElevatedCard>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-lg">
              <Zap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <CardTitle size="lg">What Makes Us Different</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{feature.title}</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <VerifiedBadge size="lg" text="Verified Platform" />
                <SecureBadge size="lg" text="Bank-Level Security" />
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Trusted by 50,000+ users across India
              </div>
            </div>
          </div>
        </CardContent>
      </ElevatedCard>

      {/* Team Section */}
      <ElevatedCard>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle size="lg">Meet Our Team</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Our founding team combines technical expertise, business strategy, and vision to build India's most trusted structured part-time work platform.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500 p-0.5">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{member.role}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </ElevatedCard>

      {/* Call to Action */}
      <ElevatedCard className="text-center">
        <CardContent className="py-12">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-full">
              <Award className="h-5 w-5" />
              <span className="font-medium">Join Our Community</span>
            </div>
            
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Ready to {user?.role === 'employer' ? 'Find Great Talent' : 'Start Your Journey'}?
            </h2>
            
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {user?.role === 'employer' 
                ? 'Connect with skilled students and professionals ready to contribute to your business growth.'
                : 'Discover verified part-time opportunities that fit your schedule and help build your career.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="gradient" 
                size="lg"
                className="flex items-center space-x-2"
              >
                <Briefcase className="h-5 w-5" />
                <span>{user?.role === 'employer' ? 'Post a Job' : 'Browse Jobs'}</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="flex items-center space-x-2"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Join Community</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </ElevatedCard>
    </div>
  );
};

export default AboutUs;
