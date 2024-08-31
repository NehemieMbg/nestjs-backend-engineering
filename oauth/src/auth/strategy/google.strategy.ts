import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import * as process from 'node:process';

/**
 * Represents a Google user profile.
 */
export interface GoogleProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{
    value: string;
    verified: boolean;
  }>;
  photos: Array<{
    value: string;
  }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // callbackURL: 'http://localhost:3000/auth/google-redirect',
      callbackURL: '/auth/google-redirect',
      scope: ['email', 'profile'],
    });
  }

  /**
   * This method is called to validate the user with Google.
   * @param accessToken - The access token provided by Google
   * @param refreshToken - The refresh token provided by Google
   * @param profile - The user's profile provided by Google
   * @param done - The callback function that will be called with the user's profile
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      avatar: photos[0].value,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
