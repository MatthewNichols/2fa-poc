import { Express } from "express";
import session, { Session } from "express-session";
import { TwoFAuthType } from "./db/fake-db";

export type CustomSession = Session & {
  user?: RequestUser;
  /** Has the user completed the 2FA login, if needed? */
  twoFAuthNeeded: boolean;
  otpPasscode?: string;
};

export function setupSession(app: Express) {
  app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
    })
  );
}

export function storeAuthInSession(req: any, userName: string, isAdmin: boolean, twoFAuthNeeded: boolean) {
  const session = req.session as CustomSession;
  session.user = {
    username: userName,
    roles: isAdmin ? ['admin', 'user'] : ['user']
  }

  session.twoFAuthNeeded = twoFAuthNeeded;
}

/**
 * Once the user has completed the 2FA login, set this to false
 * @param req 
 */
export function storeTwoFAuthCompletedInSession(req: any) {
  const session = req.session as CustomSession;
  session.twoFAuthNeeded = false;
}

export function storeOtpPasscodeInSession(req: any, otpPasscode: string) {
  const session = req.session as CustomSession;
  session.otpPasscode = otpPasscode;
}

export const checkAuthAndRoles = (roles: string[] = []): AuthenticationHandler => {
  return (req: any, res: any, next: any) => {
    const customSession = req.session as CustomSession;
    if (!customSession.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (customSession.twoFAuthNeeded) {
      return res.status(401).json({ error: "Login process not completed" });
    }

    // If roles is empty, any authenticated user is allowed
    if (roles.length === 0) {
      return next();
    }

    const loggedInUserRoles = customSession.user.roles || [];

    if (!loggedInUserRoles.some((role: string) => roles.includes(role))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};