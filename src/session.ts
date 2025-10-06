import { Express } from "express";
import session, { Session } from "express-session";

export type CustomSession = Session & {
  user?: RequestUser;
  twoFAuthRequired?: boolean;
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

export function storeAuthInSession(req: any, userName: string, isAdmin: boolean, twoFAuthRequired: boolean) {
  const session = req.session as CustomSession;
  session.user = {
    username: userName,
    roles: isAdmin ? ['admin', 'user'] : ['user']
  }

  session.twoFAuthRequired = twoFAuthRequired;
}

export const checkAuthAndRoles = (roles: string[] = []): AuthenticationHandler => {
  return (req: any, res: any, next: any) => {
    const customSession = req.session as CustomSession;
    if (!customSession.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (customSession.twoFAuthRequired) {
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