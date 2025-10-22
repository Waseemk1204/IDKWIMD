import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  MessageCircleIcon,
  PhoneIcon,
  MailIcon,
  SendIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  UsersIcon,
  HeadphonesIcon,
  XIcon,
  MinimizeIcon,
  MaximizeIcon
} from 'lucide-react';

/**
 * Live Chat Component - TODO: Implement real chat integration
 */
const LiveChatWidget: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onToggle: () => void;
  isMinimized: boolean;
}> = ({ isOpen, onClose, onToggle, isMinimized }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'support',
      message: 'Hello! Welcome to PART-TIME PAY$ support. How can I help you today?',
      timestamp: new Date(Date.now() - 30000)
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      message: message.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Simulate support response
    setTimeout(() => {
      const supportResponse = {
        id: chatMessages.length + 2,
        sender: 'support',
        message: 'Thank you for your message. A support agent will be with you shortly. In the meantime, you can also check our FAQ section for quick answers.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, supportResponse]);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    }`}>
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col h-full">
        {/* Chat Header */}
        <div className="bg-primary-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HeadphonesIcon className="w-5 h-5" />
            <span className="font-medium">Live Support</span>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={onToggle}
              className="text-white hover:text-primary-200 transition-colors"
            >
              {isMinimized ? <MaximizeIcon className="w-4 h-4" /> : <MinimizeIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-200 transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-hide space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'user' 
                        ? 'text-primary-200' 
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-600">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <SendIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Customer Support Page Component
 */
export const CustomerSupport: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Chat widget state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Handle email form changes
  const handleEmailFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate email form
  const validateEmailForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!emailForm.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!emailForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!emailForm.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!emailForm.message.trim()) {
      errors.message = 'Message is required';
    } else if (emailForm.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle email form submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmailForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus('success');
      setEmailForm({ name: '', email: '', subject: '', message: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Support options configuration
  const supportOptions = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircleIcon,
      availability: 'Available 24/7',
      action: () => {
        setIsChatOpen(true);
        setIsChatMinimized(false);
      },
      buttonText: 'Start Chat',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      icon: PhoneIcon,
      availability: 'Mon-Fri, 9 AM - 6 PM IST',
      action: () => {
        // For now, just show an alert - can be replaced with actual phone integration
        alert('Phone support: +91 9321495344\n\nOur phone lines are open Monday to Friday, 9 AM - 6 PM IST.');
      },
      buttonText: 'Call Now',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us a detailed message and get a response within 24 hours',
      icon: MailIcon,
      availability: 'Response within 24 hours',
      action: () => {
        // Scroll to email form
        document.getElementById('email-support-form')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
      },
      buttonText: 'Send Email',
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 px-4 py-2 rounded-full mb-4">
            <HeadphonesIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span className="text-primary-700 dark:text-primary-300 font-medium">Customer Support</span>
          </div>
          
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            We're Here to Help
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Choose how you'd like to connect with our support team. We're committed to providing you with the best assistance possible.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportOptions.map((option) => (
            <div
              key={option.id}
              className={`${option.color} rounded-2xl p-6 border`}
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${option.iconColor} bg-white dark:bg-neutral-800 rounded-full mb-4 shadow-sm`}>
                  <option.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {option.title}
                </h3>
                
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {option.description}
                </p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <ClockIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {option.availability}
                  </span>
                </div>
                
                <Button
                  onClick={option.action}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  {option.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Email Support Form */}
        <div id="email-support-form" className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <MailIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Email Support
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Send us a detailed message and we'll get back to you within 24 hours
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <p className="text-green-700 dark:text-green-300">
                Your message has been sent successfully! We'll respond within 24 hours.
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

          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={emailForm.name}
                onChange={handleEmailFormChange}
                error={formErrors.name}
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={emailForm.email}
                onChange={handleEmailFormChange}
                error={formErrors.email}
                placeholder="Enter your email address"
                required
              />
            </div>

            <Input
              label="Subject"
              name="subject"
              value={emailForm.subject}
              onChange={handleEmailFormChange}
              error={formErrors.subject}
              placeholder="Brief description of your issue"
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={emailForm.message}
                onChange={handleEmailFormChange}
                rows={5}
                placeholder="Please describe your issue in detail. Include any relevant information that might help us assist you better."
                required
                className={`
                  w-full px-4 py-3 bg-white dark:bg-neutral-700 border rounded-lg
                  placeholder-neutral-400 dark:placeholder-neutral-500
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  transition-all duration-200 resize-vertical
                  ${formErrors.message 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-neutral-300 dark:border-neutral-600'
                  }
                  text-neutral-900 dark:text-neutral-100
                `}
              />
              {formErrors.message && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.message}
                </p>
              )}
            </div>

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

        {/* Additional Help Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8 border border-primary-200 dark:border-primary-800">
          <div className="text-center">
            <UsersIcon className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Need More Help?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Check out our frequently asked questions or browse our help documentation for instant answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                size="md"
                onClick={() => window.open('/faq', '_blank')}
              >
                View FAQ
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => window.open('/docs', '_blank')}
              >
                Help Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Widget */}
      <LiveChatWidget
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onToggle={() => setIsChatMinimized(!isChatMinimized)}
        isMinimized={isChatMinimized}
      />
    </div>
  );
};
