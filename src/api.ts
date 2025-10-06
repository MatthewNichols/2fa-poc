import { Express } from 'express';
import { Totp, generateConfig } from "time2fa";
import { IUser, validateUserPassword, validateUser2FA, saveUser } from './db/fake-db';
import { checkAuthAndRoles, CustomSession, storeAuthInSession } from './session';

export function setupApi(app: Express) {
  /**
   * Set up common 2FA config. Is set for a longer period to 
   * allow for use 
   */
  const twoFAuthConfig = generateConfig(
    {
      period: 300,
    }
  );

  app.get('/api/hello', (req, res) => {
    res.json({ hello: 'world' });
  });

  app.post('/api/login', (req, res) => {
    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Missing request body' });
    }

    const username = req.body.username || '';
    const password = req.body.password || '';

    if (username === '' || password === '') {
      return res.status(400).json({ success: false, error: 'Missing username or password' });
    }

    const user = validateUserPassword(username, password);
    if (user) {
      storeAuthInSession(req, username, !!user.admin, user.twoFAuthRequired!);
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
  })

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/user', checkAuthAndRoles(['user']), (req, res) => {
    const customSession = req.session as CustomSession;
    const user = customSession.user;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  });

  /**
   * Setup 2FA for current user. The user is then directed to 
   * do a 2FA verify prior to the setup being complete and enforced. 
   */
  app.post('/api/setup-2fa', checkAuthAndRoles(['user']), (req, res) => {
    const customSession = req.session as CustomSession;
    const user = customSession.user as IUser;
    if (user) {
      // If 2FA already setup, return error. User can use /api/setup-2fa/reset to reset
      if (user.twoFAuthRequired) {
        return res.status(400).json({ success: false, error: '2FA already setup' });
      }



      res.json(user);
    } else {
      res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  });

  /**
   * Reset 2FA setup from current user
   */
  app.post('/api/setup-2fa/reset', checkAuthAndRoles(['user']), async (req, res) => {
    const customSession = req.session as CustomSession;
    const user = customSession.user as IUser;
    if (user) {
      if (!user.twoFAuthRequired) {
        return res.status(400).json({ error: '2FA not setup' });
      } else {
        user.twoFAuthConfigConfirmed = false;
        user.twoFAuthRequired = false;
        user.issuer = undefined;
        user.config = undefined;
        user.secret = undefined;
        user.url = undefined;

        await saveUser(user);
      }
      res.json({success: true, user});
    } else {
      res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  });

  console.log('API setup');
  
} 