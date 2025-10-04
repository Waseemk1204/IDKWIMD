import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title = "ParttimePays - Find Flexible Part-Time Jobs in India",
  description = "ParttimePays helps you discover flexible, remote, and local part-time jobs. Connect with companies hiring for 20-hour work weeks in India. Start your side hustle today!",
  keywords = "part-time jobs India, flexible jobs, side hustle, remote jobs, student jobs, 20 hour work week, freelance jobs, work from home, gig economy",
  canonical = "https://parttimepays.in/",
  ogImage = "https://parttimepays.in/og-image.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData
}) => {
  const fullTitle = title.includes('ParttimePays') ? title : `${title} | ParttimePays`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      
      {/* Override any existing title */}
      <meta property="og:title" content={fullTitle} />
      <meta name="twitter:title" content={fullTitle} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="ParttimePays" />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Force title update script */}
      <script>
        {`
          document.title = "${fullTitle}";
          if (document.querySelector('meta[name="title"]')) {
            document.querySelector('meta[name="title"]').setAttribute('content', '${fullTitle}');
          }
        `}
      </script>
    </Helmet>
  );
};

// Predefined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    title: "ParttimePays - Find Flexible Part-Time Jobs in India",
    description: "ParttimePays helps you discover flexible, remote, and local part-time jobs. Connect with companies hiring for 20-hour work weeks in India. Start your side hustle today!",
    keywords: "part-time jobs India, flexible jobs, side hustle, remote jobs, student jobs, 20 hour work week, freelance jobs, work from home, gig economy",
    canonical: "https://parttimepays.in/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ParttimePays",
      "url": "https://parttimepays.in",
      "description": "Find flexible part-time jobs and side hustles across India",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://parttimepays.in/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  },
  
  privacy: {
    title: "Privacy Policy",
    description: "Learn how ParttimePays protects your privacy and handles your personal information. Our comprehensive privacy policy covers data collection, usage, and your rights.",
    keywords: "privacy policy, data protection, personal information, GDPR compliance, ParttimePays privacy",
    canonical: "https://parttimepays.in/privacy-policy",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy",
      "url": "https://parttimepays.in/privacy-policy",
      "description": "ParttimePays Privacy Policy - How we protect your data",
      "isPartOf": {
        "@type": "WebSite",
        "name": "ParttimePays",
        "url": "https://parttimepays.in"
      }
    }
  },

  about: {
    title: "About Us",
    description: "Learn about ParttimePays - India's leading platform for flexible part-time jobs. Discover our mission to connect talented professionals with flexible work opportunities.",
    keywords: "about ParttimePays, company information, mission, flexible work platform, part-time job marketplace",
    canonical: "https://parttimepays.in/about",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About ParttimePays",
      "url": "https://parttimepays.in/about",
      "description": "Learn about ParttimePays and our mission",
      "isPartOf": {
        "@type": "WebSite",
        "name": "ParttimePays",
        "url": "https://parttimepays.in"
      }
    }
  },

  contact: {
    title: "Contact Us",
    description: "Get in touch with ParttimePays support team. We're here to help with your questions about part-time jobs, platform features, and account support.",
    keywords: "contact ParttimePays, customer support, help, support team, contact information",
    canonical: "https://parttimepays.in/contact",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact ParttimePays",
      "url": "https://parttimepays.in/contact",
      "description": "Contact ParttimePays support team",
      "isPartOf": {
        "@type": "WebSite",
        "name": "ParttimePays",
        "url": "https://parttimepays.in"
      }
    }
  },

  blogs: {
    title: "Blog - Career Tips & Job Market Insights",
    description: "Read the latest career tips, job market insights, and success stories on the ParttimePays blog. Get expert advice for your part-time career journey.",
    keywords: "career tips, job market insights, part-time career advice, success stories, career blog",
    canonical: "https://parttimepays.in/blogs",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "ParttimePays Blog",
      "url": "https://parttimepays.in/blogs",
      "description": "Career tips and job market insights",
      "isPartOf": {
        "@type": "WebSite",
        "name": "ParttimePays",
        "url": "https://parttimepays.in"
      }
    }
  }
};
