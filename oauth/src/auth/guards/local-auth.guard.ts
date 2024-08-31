import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard to handle local authentication.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
