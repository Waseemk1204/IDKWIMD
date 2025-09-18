import React from 'react';

const features = [
  {
    id: 'flexible-work',
    title: 'Flexible Work',
    description: 'Find part-time opportunities that fit your schedule and skills.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'time-tracking',
    title: 'Time Tracking',
    description: 'Simple timesheet submission and approval process.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'secure-payments',
    title: 'Secure Payments',
    description: 'Get paid on time, every time with our secure payment system.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    )
  }
];

export const FeaturesCycle: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <div 
          key={feature.id} 
          className="relative bg-white dark:bg-neutral-700 p-8 rounded-2xl shadow-soft animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div 
            className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white mb-6"
            aria-hidden="true"
          >
            {feature.icon}
          </div>
          <h3 className="text-xl leading-6 font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            {feature.title}
          </h3>
          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeaturesCycle;
