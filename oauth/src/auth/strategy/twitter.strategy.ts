import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import * as process from 'node:process';

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
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor() {
    super({
      clientType: 'confidential', //depends on your Twitter app settings, valid values are `confidential` or `public`
      clientID: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      callbackURL: '/auth/twitter/callback',
      scope: ['tweet.read', 'users.read', 'offline.access'],
    });
  }

  /**
   * This method is called to validate the user with Twitter.
   * @param accessToken - The access token provided by Twitter
   * @param refreshToken - The refresh token provided by Twitter
   * @param profile - The user's profile provided by Twitter
   * @param done - The callback function that will be called with the user's profile
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log(profile);

    console.log('Success!', { accessToken, refreshToken });
    return done(null, profile);
  }
}
