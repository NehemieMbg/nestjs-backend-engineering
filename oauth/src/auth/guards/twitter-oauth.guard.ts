import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwitterOAuthGuard extends AuthGuard('twitter') {
  constructor(private configService: ConfigService) {
    // super();
    super({
      accessType: 'offline',
    });
  }
}
