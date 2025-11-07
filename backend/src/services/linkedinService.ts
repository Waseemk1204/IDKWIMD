import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import config from '../config';

export interface LinkedInProfile {
  linkedinId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  summary?: string;
  profilePicture?: string;
  location?: string;
  positions?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  educations?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
  }>;
  skills?: string[];
  profileUrl?: string;
}

/**
 * Parse LinkedIn profile data into our application format
 * Handles both OpenID Connect userinfo and legacy profile formats
 */
export const parseLinkedInProfile = (profile: any): LinkedInProfile => {
  // OpenID Connect userinfo format
  const isOpenIDConnect = profile.sub || profile._json?.sub;
  
  if (isOpenIDConnect) {
    const json = profile._json || profile;
    return {
      linkedinId: json.sub || profile.id,
      fullName: json.name || `${json.given_name || ''} ${json.family_name || ''}`.trim(),
      firstName: json.given_name || '',
      lastName: json.family_name || '',
      email: json.email || '',
      headline: json.headline || '',
      summary: json.bio || '',
      profilePicture: json.picture || '',
      location: json.locale || '',
      profileUrl: json.profile || '',
      positions: [],
      educations: [],
      skills: [],
    };
  }
  
  // Legacy format (fallback)
  const parsedProfile: LinkedInProfile = {
    linkedinId: profile.id,
    fullName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
    firstName: profile.name?.givenName || '',
    lastName: profile.name?.familyName || '',
    email: profile.emails?.[0]?.value || '',
    headline: profile.headline || profile._json?.headline || '',
    summary: profile.summary || profile._json?.summary || '',
    profilePicture: profile.photos?.[0]?.value || profile._json?.pictureUrl || '',
    location: profile._json?.location?.name || '',
    profileUrl: profile._json?.publicProfileUrl || '',
  };

  // Parse positions (work experience) - only in legacy format
  if (profile._json?.positions?.values) {
    parsedProfile.positions = profile._json.positions.values.map((pos: any) => ({
      title: pos.title || '',
      company: pos.company?.name || '',
      startDate: pos.startDate ? `${pos.startDate.year}-${pos.startDate.month || '01'}` : '',
      endDate: pos.endDate ? `${pos.endDate.year}-${pos.endDate.month || '01'}` : undefined,
      description: pos.summary || '',
    }));
  }

  // Parse education - only in legacy format
  if (profile._json?.educations?.values) {
    parsedProfile.educations = profile._json.educations.values.map((edu: any) => ({
      institution: edu.schoolName || '',
      degree: edu.degree || '',
      field: edu.fieldOfStudy || '',
      startDate: edu.startDate ? `${edu.startDate.year}` : '',
      endDate: edu.endDate ? `${edu.endDate.year}` : undefined,
    }));
  }

  // Parse skills - only in legacy format
  if (profile._json?.skills?.values) {
    parsedProfile.skills = profile._json.skills.values.map((skill: any) => skill.skill?.name || skill.name).filter(Boolean);
  }

  return parsedProfile;
};

/**
 * Configure LinkedIn OAuth Strategy
 */
export const configureLinkedInStrategy = () => {
  console.log('🔍 Configuring LinkedIn OAuth Strategy...');
  console.log('  LINKEDIN_CLIENT_ID:', config.LINKEDIN_CLIENT_ID ? `${config.LINKEDIN_CLIENT_ID.substring(0, 5)}...` : 'NOT SET');
  console.log('  LINKEDIN_CLIENT_SECRET:', config.LINKEDIN_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET');
  console.log('  LINKEDIN_CALLBACK_URL:', config.LINKEDIN_CALLBACK_URL);
  
  if (!config.LINKEDIN_CLIENT_ID || !config.LINKEDIN_CLIENT_SECRET) {
    console.warn('❌ LinkedIn OAuth credentials not configured. LinkedIn authentication will not be available.');
    return;
  }

  console.log('✅ LinkedIn credentials found, registering strategy...');
  const strategy = new OAuth2Strategy(
    {
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: config.LINKEDIN_CLIENT_ID,
      clientSecret: config.LINKEDIN_CLIENT_SECRET,
      callbackURL: config.LINKEDIN_CALLBACK_URL,
      scope: ['openid', 'profile', 'email'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Fetch user profile from OpenID Connect userinfo endpoint
        const response = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('LinkedIn userinfo error:', response.status, errorText);
          return done(new Error(`Failed to fetch LinkedIn profile: ${response.status}`), null);
        }
        
        const userinfo = await response.json() as any;
        console.log('LinkedIn userinfo response:', userinfo);
        
        const linkedInProfile = parseLinkedInProfile({ 
          _json: userinfo, 
          sub: userinfo.sub,
          name: userinfo.name,
          given_name: userinfo.given_name,
          family_name: userinfo.family_name,
          email: userinfo.email,
          picture: userinfo.picture,
        });
        
        return done(null, { accessToken, refreshToken, profile: linkedInProfile });
      } catch (error) {
        console.error('LinkedIn OAuth error:', error);
        return done(error, null);
      }
    }
  );
  
  // Override the userProfile method to prevent automatic profile fetching
  strategy.userProfile = function(accessToken: string, done: any) {
    // Skip automatic profile fetching - we handle it in the verify callback
    done(null, {});
  };
  
  passport.use('linkedin', strategy);
  console.log('✅ LinkedIn OAuth strategy registered successfully!');
};

/**
 * Extract profile data for user model
 */
export const extractUserDataFromLinkedIn = (linkedInProfile: LinkedInProfile, role: 'employee' | 'employer') => {
  const baseData = {
    fullName: linkedInProfile.fullName,
    email: linkedInProfile.email,
    profilePhoto: linkedInProfile.profilePicture,
    location: linkedInProfile.location,
    linkedinProfile: {
      linkedinId: linkedInProfile.linkedinId,
      profileUrl: linkedInProfile.profileUrl,
      lastSynced: new Date(),
      autoImportEnabled: true,
    },
  };

  if (role === 'employee') {
    return {
      ...baseData,
      about: linkedInProfile.summary,
      headline: linkedInProfile.headline,
      skills: linkedInProfile.skills || [],
      experience: linkedInProfile.positions?.map(pos => ({
        company: pos.company,
        title: pos.title,
        startDate: pos.startDate,
        endDate: pos.endDate,
        description: pos.description,
      })),
      education: linkedInProfile.educations?.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.field,
        startYear: edu.startDate,
        endYear: edu.endDate,
      })),
    };
  } else {
    // For employers, we'll focus on company info (future enhancement)
    return {
      ...baseData,
      about: linkedInProfile.summary,
      companyInfo: {
        companyName: linkedInProfile.positions?.[0]?.company || '',
        description: linkedInProfile.summary,
      },
    };
  }
};


