import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
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
 */
export const parseLinkedInProfile = (profile: any): LinkedInProfile => {
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

  // Parse positions (work experience)
  if (profile._json?.positions?.values) {
    parsedProfile.positions = profile._json.positions.values.map((pos: any) => ({
      title: pos.title || '',
      company: pos.company?.name || '',
      startDate: pos.startDate ? `${pos.startDate.year}-${pos.startDate.month || '01'}` : '',
      endDate: pos.endDate ? `${pos.endDate.year}-${pos.endDate.month || '01'}` : undefined,
      description: pos.summary || '',
    }));
  }

  // Parse education
  if (profile._json?.educations?.values) {
    parsedProfile.educations = profile._json.educations.values.map((edu: any) => ({
      institution: edu.schoolName || '',
      degree: edu.degree || '',
      field: edu.fieldOfStudy || '',
      startDate: edu.startDate ? `${edu.startDate.year}` : '',
      endDate: edu.endDate ? `${edu.endDate.year}` : undefined,
    }));
  }

  // Parse skills
  if (profile._json?.skills?.values) {
    parsedProfile.skills = profile._json.skills.values.map((skill: any) => skill.skill?.name || skill.name).filter(Boolean);
  }

  return parsedProfile;
};

/**
 * Configure LinkedIn OAuth Strategy
 */
export const configureLinkedInStrategy = () => {
  if (!config.linkedIn?.clientId || !config.linkedIn?.clientSecret) {
    console.warn('LinkedIn OAuth credentials not configured. LinkedIn authentication will not be available.');
    return;
  }

  passport.use(
    new LinkedInStrategy(
      {
        clientID: config.linkedIn.clientId,
        clientSecret: config.linkedIn.clientSecret,
        callbackURL: config.linkedIn.callbackURL,
        scope: ['openid', 'profile', 'email'], // Updated scopes for LinkedIn API v2
        state: true,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const linkedInProfile = parseLinkedInProfile(profile);
          return done(null, { accessToken, refreshToken, profile: linkedInProfile });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
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


