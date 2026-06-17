import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Custom OAuth callback guard that doesn't throw 500 on failure.
 * Instead, it lets the request through so the controller handler
 * can redirect the user to the frontend with an error parameter.
 */
@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleCallbackGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      this.logger.error(
        `[Google OAuth Callback] Auth failed: ${err?.message || 'No user returned'}`,
        err?.stack,
      );
      // Don't throw — return null so the controller can handle the redirect
      return null;
    }
    return user;
  }
}

@Injectable()
export class GithubCallbackGuard extends AuthGuard('github') {
  private readonly logger = new Logger(GithubCallbackGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      this.logger.error(
        `[GitHub OAuth Callback] Auth failed: ${err?.message || 'No user returned'}`,
        err?.stack,
      );
      return null;
    }
    return user;
  }
}

@Injectable()
export class MicrosoftCallbackGuard extends AuthGuard('microsoft') {
  private readonly logger = new Logger(MicrosoftCallbackGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      this.logger.error(
        `[Microsoft OAuth Callback] Auth failed: ${err?.message || 'No user returned'}`,
        err?.stack,
      );
      return null;
    }
    return user;
  }
}
