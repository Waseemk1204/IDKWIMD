import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Users, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SEO, SEOConfigs } from '../../components/seo/SEO';

export const PrivacyPolicy: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  interface Section {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: (string | { subtitle: string; items: string[] })[];
  }

  const sections: Section[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: <Shield className="w-5 h-5" />,
      content: [
        'Welcome to PART-TIME PAY$. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.',
        'By using our services, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.'
      ]
    },
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: <Eye className="w-5 h-5" />,
      content: [
        'We collect several types of information to provide and improve our services:',
        {
          subtitle: 'Personal Information',
          items: [
            'Name, email address, and phone number',
            'Profile information including skills, experience, and education',
            'Payment information (processed securely through third-party providers)',
            'Identity verification documents when required',
            'Communication preferences and account settings'
          ]
        },
        {
          subtitle: 'Usage Data',
          items: [
            'IP address, browser type, and device information',
            'Pages visited, time spent on pages, and navigation patterns',
            'Job search queries and application history',
            'Time tracking data for work performed',
            'Communication logs and message history'
          ]
        },
        {
          subtitle: 'Cookies and Tracking Technologies',
          items: [
            'Essential cookies for platform functionality',
            'Analytics cookies to understand user behavior',
            'Preference cookies to remember your settings',
            'Marketing cookies for relevant advertising (with your consent)'
          ]
        }
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: <Users className="w-5 h-5" />,
      content: [
        'We use your information for the following purposes:',
        {
          subtitle: 'Service Provision',
          items: [
            'Creating and managing your account',
            'Matching you with relevant job opportunities or candidates',
            'Processing payments and managing financial transactions',
            'Providing customer support and responding to inquiries',
            'Facilitating communication between users'
          ]
        },
        {
          subtitle: 'Platform Improvement',
          items: [
            'Analyzing usage patterns to improve our services',
            'Developing new features and functionality',
            'Conducting research and analytics',
            'Monitoring platform security and preventing fraud',
            'Ensuring compliance with legal requirements'
          ]
        },
        {
          subtitle: 'Communication',
          items: [
            'Sending important account notifications',
            'Providing updates about job opportunities or applications',
            'Sharing platform news and feature announcements',
            'Marketing communications (with your consent)',
            'Legal notices and policy updates'
          ]
        }
      ]
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing & Disclosure',
      icon: <Lock className="w-5 h-5" />,
      content: [
        'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:',
        {
          subtitle: 'Service Providers',
          items: [
            'Payment processors for secure transaction handling',
            'Cloud hosting providers for data storage and processing',
            'Analytics services to understand platform usage',
            'Customer support tools to provide assistance',
            'Security services to protect against fraud and abuse'
          ]
        },
        {
          subtitle: 'Legal Requirements',
          items: [
            'When required by law or legal process',
            'To protect our rights, property, or safety',
            'To protect the rights and safety of our users',
            'In connection with legal investigations',
            'To comply with regulatory requirements'
          ]
        },
        {
          subtitle: 'Business Transfers',
          items: [
            'In the event of a merger, acquisition, or sale of assets',
            'During corporate restructuring or reorganization',
            'With your explicit consent for specific purposes'
          ]
        }
      ]
    },
    {
      id: 'cookies-tracking',
      title: 'Cookies & Tracking',
      icon: <Eye className="w-5 h-5" />,
      content: [
        'We use cookies and similar tracking technologies to enhance your experience on our platform:',
        {
          subtitle: 'Types of Cookies',
          items: [
            'Essential cookies: Required for basic platform functionality',
            'Performance cookies: Help us analyze and improve our services',
            'Functional cookies: Remember your preferences and settings',
            'Marketing cookies: Deliver relevant advertisements (with consent)'
          ]
        },
        {
          subtitle: 'Managing Cookies',
          items: [
            'You can control cookies through your browser settings',
            'Disabling essential cookies may affect platform functionality',
            'You can opt-out of marketing cookies at any time',
            'We respect your cookie preferences and Do Not Track signals'
          ]
        }
      ]
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: <Shield className="w-5 h-5" />,
      content: [
        'We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy:',
        {
          subtitle: 'Account Data',
          items: [
            'Active accounts: Data retained while account is active',
            'Inactive accounts: Data may be retained for up to 2 years',
            'Deleted accounts: Most data deleted within 30 days',
            'Legal requirements: Some data retained for compliance purposes'
          ]
        },
        {
          subtitle: 'Transaction Data',
          items: [
            'Payment records retained for 7 years for tax and legal compliance',
            'Communication logs retained for 1 year for dispute resolution',
            'Analytics data aggregated and anonymized after 2 years'
          ]
        }
      ]
    },
    {
      id: 'user-rights',
      title: 'Your Rights',
      icon: <Users className="w-5 h-5" />,
      content: [
        'You have several rights regarding your personal information:',
        {
          subtitle: 'Access and Control',
          items: [
            'Right to access your personal data',
            'Right to update or correct inaccurate information',
            'Right to delete your account and associated data',
            'Right to download your data in a portable format',
            'Right to restrict processing of your information'
          ]
        },
        {
          subtitle: 'Communication Preferences',
          items: [
            'Opt-out of marketing communications at any time',
            'Control notification settings in your account',
            'Choose your cookie preferences',
            'Update your privacy settings as needed'
          ]
        },
        {
          subtitle: 'Exercising Your Rights',
          items: [
            'Contact us at privacy@parttimepays.com',
            'Use the privacy settings in your account dashboard',
            'Submit requests through our support system',
            'We will respond to requests within 30 days'
          ]
        }
      ]
    },
    {
      id: 'security',
      title: 'Data Security',
      icon: <Lock className="w-5 h-5" />,
      content: [
        'We implement robust security measures to protect your information:',
        {
          subtitle: 'Technical Safeguards',
          items: [
            'End-to-end encryption for sensitive data transmission',
            'Secure server infrastructure with regular security updates',
            'Multi-factor authentication for account protection',
            'Regular security audits and vulnerability assessments',
            'Secure payment processing through PCI-compliant providers'
          ]
        },
        {
          subtitle: 'Operational Safeguards',
          items: [
            'Limited access to personal data on a need-to-know basis',
            'Employee training on data protection and privacy',
            'Incident response procedures for security breaches',
            'Regular backups and disaster recovery planning',
            'Compliance with industry security standards'
          ]
        }
      ]
    }
  ];

  const renderContent = (content: (string | { subtitle: string; items: string[] })[]) => {
    return content.map((item, index) => {
      if (typeof item === 'string') {
        return (
          <p key={index} className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
            {item}
          </p>
        );
      } else if (item.subtitle) {
        return (
          <div key={index} className="mb-6">
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
              {item.subtitle}
            </h4>
            <ul className="space-y-2 ml-4">
              {item.items.map((listItem: string, listIndex: number) => (
                <li key={listIndex} className="flex items-start">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {listItem}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <SEO {...SEOConfigs.privacy} />
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 shadow-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to="/" 
              className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
          
          <div className="text-center">
            {/* Logo */}
            <Link to="/" className="inline-block mb-6">
              <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-500">
                PART-TIME PAY$
              </h1>
            </Link>
            
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Privacy Policy
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-4">
              Last updated: {lastUpdatedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Table of Contents */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-soft p-6 mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Table of Contents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
              >
                <span className="text-primary-500 mr-3 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {section.icon}
                </span>
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {index + 1}. {section.title}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-soft p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-primary-600 dark:text-primary-400">
                    {section.icon}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {index + 1}. {section.title}
                </h3>
              </div>
              
              <div className="prose prose-lg max-w-none">
                {renderContent(section.content)}
              </div>
            </section>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-8 mt-12">
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
              Contact Us About Privacy
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or how we handle your personal information, 
              please don't hesitate to contact us through any of the following methods:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Email</h4>
              <a 
                href="mailto:privacy@parttimepays.com" 
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                privacy@parttimepays.com
              </a>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Phone</h4>
              <a 
                href="tel:+919321495344" 
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                +91 9321495344
              </a>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Address</h4>
              <p className="text-neutral-600 dark:text-neutral-400">
                Tech Hub, Bangalore<br />
                Karnataka 560001, India
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              We typically respond to privacy-related inquiries within 2-3 business days.
            </p>
          </div>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-12">
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant="outline"
            className="mx-auto"
          >
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  );
};
