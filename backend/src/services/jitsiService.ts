import jwt from 'jsonwebtoken';

export interface JitsiConfig {
  domain: string;
  appId: string;
  privateKey: string;
}

export interface JitsiUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface JitsiRoomConfig {
  roomName: string;
  user: JitsiUser;
  moderator?: boolean;
  audio?: boolean;
  video?: boolean;
  screenShare?: boolean;
  recording?: boolean;
  maxParticipants?: number;
}

class JitsiService {
  private config: JitsiConfig;

  constructor() {
    this.config = {
      domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
      appId: process.env.JITSI_APP_ID || '',
      privateKey: process.env.JITSI_PRIVATE_KEY || ''
    };
  }

  /**
   * Generate JWT token for Jitsi authentication
   */
  generateJWT(user: JitsiUser, roomName: string, moderator: boolean = false): string {
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      iss: this.config.appId,
      aud: 'jitsi',
      exp: now + 3600, // 1 hour
      nbf: now,
      room: roomName,
      sub: this.config.domain,
      context: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        },
        features: {
          'livestreaming': false,
          'recording': false,
          'transcription': false,
          'outbound-call': false
        },
        moderator: moderator
      }
    };

    return jwt.sign(payload, this.config.privateKey, { algorithm: 'RS256' });
  }

  /**
   * Generate Jitsi room URL with authentication
   */
  generateRoomUrl(config: JitsiRoomConfig): string {
    const { roomName, user, moderator = false, audio = true, video = true, screenShare = true, recording = false, maxParticipants } = config;
    
    const params = new URLSearchParams();
    
    // Basic configuration
    params.append('jwt', this.generateJWT(user, roomName, moderator));
    params.append('userInfo.displayName', user.name);
    params.append('userInfo.email', user.email);
    
    if (user.avatar) {
      params.append('userInfo.avatarUrl', user.avatar);
    }

    // Feature flags
    params.append('config.startWithAudioMuted', (!audio).toString());
    params.append('config.startWithVideoMuted', (!video).toString());
    params.append('config.enableWelcomePage', 'false');
    params.append('config.prejoinPageEnabled', 'false');
    
    // Screen sharing
    if (screenShare) {
      params.append('config.enableLayerSizing', 'true');
      params.append('config.enableNoisyMicDetection', 'true');
    }

    // Recording
    if (recording) {
      params.append('config.enableRecording', 'true');
    }

    // Max participants
    if (maxParticipants) {
      params.append('config.maxParticipants', maxParticipants.toString());
    }

    // UI customization
    params.append('config.hideDisplayName', 'false');
    params.append('config.hideEmail', 'false');
    params.append('config.hideAddRoomButton', 'true');
    params.append('config.hideInviteMoreButton', 'false');

    return `https://${this.config.domain}/${roomName}?${params.toString()}`;
  }

  /**
   * Generate simple room URL without authentication (for public rooms)
   */
  generateSimpleRoomUrl(roomName: string, user: JitsiUser): string {
    const params = new URLSearchParams();
    params.append('userInfo.displayName', user.name);
    params.append('userInfo.email', user.email);
    
    if (user.avatar) {
      params.append('userInfo.avatarUrl', user.avatar);
    }

    // Basic configuration
    params.append('config.startWithAudioMuted', 'false');
    params.append('config.startWithVideoMuted', 'false');
    params.append('config.enableWelcomePage', 'false');
    params.append('config.prejoinPageEnabled', 'false');
    params.append('config.hideDisplayName', 'false');
    params.append('config.hideEmail', 'false');

    return `https://${this.config.domain}/${roomName}?${params.toString()}`;
  }

  /**
   * Create a meeting room with specific configuration
   */
  createMeetingRoom(config: JitsiRoomConfig): {
    roomName: string;
    roomUrl: string;
    jwt: string;
  } {
    const jwt = this.generateJWT(config.user, config.roomName, config.moderator);
    const roomUrl = this.generateRoomUrl(config);

    return {
      roomName: config.roomName,
      roomUrl,
      jwt
    };
  }

  /**
   * Generate unique room name
   */
  generateRoomName(prefix: string = 'comms'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Validate Jitsi configuration
   */
  validateConfig(): boolean {
    return !!(this.config.domain && this.config.appId && this.config.privateKey);
  }

  /**
   * Get Jitsi iframe API configuration
   */
  getIframeConfig(roomName: string, user: JitsiUser, options: any = {}): any {
    return {
      roomName,
      width: options.width || '100%',
      height: options.height || '100%',
      parentNode: options.parentNode || undefined,
      configOverwrite: {
        startWithAudioMuted: options.audio === false,
        startWithVideoMuted: options.video === false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        hideDisplayName: false,
        hideEmail: false,
        ...options.configOverwrite
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_POWERED_BY: false,
        ...options.interfaceConfigOverwrite
      },
      userInfo: {
        displayName: user.name,
        email: user.email,
        avatar: user.avatar
      }
    };
  }
}

export default new JitsiService();
