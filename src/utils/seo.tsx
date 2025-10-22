// Comprehensive SEO utilities for meta tags, structured data, and sitemap optimization

import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'job';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  structuredData?: any;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

// Default SEO configuration
const defaultSEO = {
  title: 'PartTimePays - Find Part-Time Jobs & Freelance Opportunities',
  description: 'Connect with part-time job opportunities and freelance work. Find flexible employment that fits your schedule. Join thousands of students and professionals.',
  keywords: [
    'part time jobs',
    'freelance work',
    'student jobs',
    'flexible employment',
    'remote work',
    'job opportunities',
    'career development',
    'work from home'
  ],
  image: '/og-image.jpg',
  url: 'https://parttimepays.in',
  type: 'website' as const,
  author: 'PartTimePays Team'
};

// Generate structured data for different content types
export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PartTimePays',
    url: 'https://parttimepays.in',
    logo: 'https://parttimepays.in/logo.png',
    description: 'A platform connecting students and professionals with part-time job opportunities',
    sameAs: [
      'https://twitter.com/parttimepays',
      'https://linkedin.com/company/parttimepays',
      'https://facebook.com/parttimepays'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXXX-XXXX',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi']
    }
  },

  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PartTimePays',
    url: 'https://parttimepays.in',
    description: 'Find part-time jobs and freelance opportunities',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://parttimepays.in/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  },

  jobPosting: (job: any) => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.postedDate,
    validThrough: job.expiryDate,
    employmentType: job.type,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      sameAs: job.companyWebsite || ''
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'IN'
      }
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.minRate,
        maxValue: job.maxRate,
        unitText: 'HOUR'
      }
    },
    qualifications: job.requirements,
    skills: job.skills,
    workHours: job.hours,
    url: `https://parttimepays.in/jobs/${job.id}`
  }),

  article: (article: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.thumbnail,
    datePublished: article.publishDate,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorRole
    },
    publisher: {
      '@type': 'Organization',
      name: 'PartTimePays',
      logo: {
        '@type': 'ImageObject',
        url: 'https://parttimepays.in/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://parttimepays.in/blog/${article.id}`
    }
  }),

  breadcrumbList: (breadcrumbs: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }),

  faq: (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  })
};

// Generate meta tags
export const generateMetaTags = (seo: SEOProps) => {
  const title = seo.title ? `${seo.title} | PartTimePays` : defaultSEO.title;
  const description = seo.description || defaultSEO.description;
  const keywords = seo.keywords ? [...defaultSEO.keywords, ...seo.keywords].join(', ') : defaultSEO.keywords.join(', ');
  const image = seo.image || defaultSEO.image;
  const url = seo.url || defaultSEO.url;

  return {
    title,
    description,
    keywords,
    image,
    url,
    type: seo.type || defaultSEO.type,
    author: seo.author || defaultSEO.author
  };
};

// SEO component
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  structuredData: customStructuredData,
  canonical,
  noindex,
  nofollow
}) => {
  const meta = generateMetaTags({
    title,
    description,
    keywords,
    image,
    url,
    type,
    author
  });

  const robots = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta name="author" content={meta.author} />
      <meta name="robots" content={robots} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content="PartTimePays" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Structured Data */}
      {customStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(customStructuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: 'PartTimePays - Find Part-Time Jobs & Freelance Opportunities',
    description: 'Connect with part-time job opportunities and freelance work. Find flexible employment that fits your schedule. Join thousands of students and professionals.',
    keywords: ['part time jobs', 'freelance work', 'student jobs', 'flexible employment'],
    structuredData: structuredData.website
  },

  jobs: {
    title: 'Browse Part-Time Jobs',
    description: 'Discover hundreds of part-time job opportunities across various industries. Find flexible work that fits your schedule.',
    keywords: ['part time jobs', 'job listings', 'employment opportunities'],
    structuredData: structuredData.website
  },

  jobDetail: (job: any) => ({
    title: `${job.title} - ${job.company}`,
    description: job.description?.substring(0, 160) || `Apply for ${job.title} position at ${job.company}`,
    keywords: [job.title, job.company, job.location, ...job.skills],
    type: 'job' as const,
    structuredData: structuredData.jobPosting(job)
  }),

  blog: {
    title: 'Career Tips & Job Market Insights',
    description: 'Stay updated with the latest career advice, job market trends, and professional development tips.',
    keywords: ['career advice', 'job market', 'professional development', 'career tips'],
    structuredData: structuredData.website
  },

  blogPost: (post: any) => ({
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    type: 'article' as const,
    author: post.author,
    publishedTime: post.publishDate,
    structuredData: structuredData.article(post)
  }),

  profile: {
    title: 'User Profile',
    description: 'Manage your profile and showcase your skills to potential employers.',
    noindex: true
  },

  login: {
    title: 'Sign In',
    description: 'Sign in to your PartTimePays account to access job opportunities and manage your profile.',
    noindex: true
  },

  signup: {
    title: 'Create Account',
    description: 'Join PartTimePays to find part-time jobs and freelance opportunities.',
    noindex: true
  }
};

// Generate sitemap data
export const generateSitemapData = () => {
  const baseUrl = 'https://parttimepays.in';
  const currentDate = new Date().toISOString();

  return {
    staticPages: [
      {
        url: `${baseUrl}/`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        url: `${baseUrl}/jobs`,
        lastmod: currentDate,
        changefreq: 'hourly',
        priority: '0.9'
      },
      {
        url: `${baseUrl}/blog`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.8'
      },
      {
        url: `${baseUrl}/about`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        url: `${baseUrl}/contact`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        url: `${baseUrl}/privacy`,
        lastmod: currentDate,
        changefreq: 'yearly',
        priority: '0.3'
      },
      {
        url: `${baseUrl}/terms`,
        lastmod: currentDate,
        changefreq: 'yearly',
        priority: '0.3'
      }
    ],
    dynamicPages: {
      jobs: {
        url: `${baseUrl}/jobs`,
        lastmod: currentDate,
        changefreq: 'hourly',
        priority: '0.9'
      },
      blogPosts: {
        url: `${baseUrl}/blog`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.8'
      }
    }
  };
};

// SEO utilities
export const seoUtils = {
  // Generate breadcrumb structured data
  generateBreadcrumbs: (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { name: 'Home', url: 'https://parttimepays.in/' }
    ];

    let currentPath = '';
    segments.forEach(segment => {
      currentPath += `/${segment}`;
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        name: name.replace('-', ' '),
        url: `https://parttimepays.in${currentPath}`
      });
    });

    return structuredData.breadcrumbList(breadcrumbs);
  },

  // Generate FAQ structured data
  generateFAQ: (faqs: Array<{ question: string; answer: string }>) => {
    return structuredData.faq(faqs);
  },

  // Optimize images for SEO
  optimizeImage: (src: string, alt: string, width?: number, height?: number) => {
    return {
      src,
      alt,
      width,
      height,
      loading: 'lazy' as const,
      decoding: 'async' as const
    };
  },

  // Generate meta description from content
  generateDescription: (content: string, maxLength = 160) => {
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }
    return cleanContent.substring(0, maxLength - 3) + '...';
  },

  // Check if URL is canonical
  isCanonical: (url: string) => {
    return !url.includes('?') && !url.includes('#');
  }
};
