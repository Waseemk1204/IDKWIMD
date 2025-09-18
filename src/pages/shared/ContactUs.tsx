import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  MailIcon, 
  PhoneIcon, 
  MapPinIcon, 
  SendIcon, 
  FacebookIcon, 
  TwitterIcon, 
  LinkedinIcon, 
  InstagramIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';

/**
 * Contact Us Page Component
 * 
 * Features:
 * - Contact form with validation
 * - Official contact details
 * - Social media links
 * - Professional design consistent with platform
 * - Light/Dark mode support
 * - Success/Error states
 */
export const ContactUs: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success response
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      setSubmitStatus('error');
      // Clear error message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contact details data
  const contactDetails = [
    {
      icon: <MailIcon className="w-5 h-5" />,
      label: 'Email',
      value: 'support@parttimepays.com',
      href: 'mailto:support@parttimepays.com'
    },
    {
      icon: <PhoneIcon className="w-5 h-5" />,
      label: 'Phone',
      value: '+91 98765 43210',
      href: 'tel:+919876543210'
    },
    {
      icon: <MapPinIcon className="w-5 h-5" />,
      label: 'Address',
      value: 'Tech Hub, Bangalore, Karnataka 560001, India',
      href: 'https://maps.google.com/?q=Bangalore,Karnataka,India'
    }
  ];

  // Social media links
  const socialLinks = [
    {
      name: 'Facebook',
      icon: <FacebookIcon className="w-5 h-5" />,
      href: 'https://facebook.com/parttimepays',
      color: 'hover:text-blue-600 dark:hover:text-blue-400'
    },
    {
      name: 'Twitter',
      icon: <TwitterIcon className="w-5 h-5" />,
      href: 'https://twitter.com/parttimepays',
      color: 'hover:text-sky-500 dark:hover:text-sky-400'
    },
    {
      name: 'LinkedIn',
      icon: <LinkedinIcon className="w-5 h-5" />,
      href: 'https://linkedin.com/company/parttimepays',
      color: 'hover:text-blue-700 dark:hover:text-blue-500'
    },
    {
      name: 'Instagram',
      icon: <InstagramIcon className="w-5 h-5" />,
      href: 'https://instagram.com/parttimepays',
      color: 'hover:text-pink-600 dark:hover:text-pink-400'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Have questions, feedback, or need support? We're here to help! Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              Send us a Message
            </h2>

            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                <p className="text-green-700 dark:text-green-300">
                  Thank you for your message! We'll get back to you within 24 hours.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center">
                <AlertCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                <p className="text-red-700 dark:text-red-300">
                  Sorry, there was an error sending your message. Please try again.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Enter your full name"
                required
              />

              {/* Email Field */}
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email address"
                required
              />

              {/* Subject Field */}
              <Input
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                error={errors.subject}
                placeholder="What is this regarding?"
                required
              />

              {/* Message Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us how we can help you..."
                  required
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-neutral-700 border rounded-lg
                    placeholder-neutral-400 dark:placeholder-neutral-500
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-all duration-200 resize-vertical
                    ${errors.message 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-neutral-300 dark:border-neutral-600'
                    }
                    text-neutral-900 dark:text-neutral-100
                  `}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
                leftIcon={<SendIcon className="w-4 h-4" />}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                {contactDetails.map((detail, index) => (
                  <a
                    key={index}
                    href={detail.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                      {detail.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {detail.label}
                      </p>
                      <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                        {detail.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Business Hours
              </h3>
              <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
                <p className="text-sm mt-4 text-neutral-500 dark:text-neutral-500">
                  * All times are in Indian Standard Time (IST)
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Follow Us
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Stay connected with us on social media for updates, tips, and community highlights.
              </p>
              
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      w-12 h-12 bg-neutral-100 dark:bg-neutral-700 rounded-lg 
                      flex items-center justify-center text-neutral-600 dark:text-neutral-400
                      hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all
                      transform hover:scale-110 ${social.color}
                    `}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8 border border-primary-200 dark:border-primary-800">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Need Quick Help?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Check out our frequently asked questions or browse our help documentation for instant answers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open('/help', '_blank')}
                >
                  Help Center
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open('/faq', '_blank')}
                >
                  FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
