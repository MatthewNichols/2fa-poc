import { Request, Response } from 'express';

/**
 * Augment the global namespace with our custom types.
 * For other global types, classes, etc. see the
 * /back-end/types folder. For types that need to be shared
 * between the front-end and back-end, see the
 * /common folder.
 */
declare global {
   /**
    * Express middleware that checks if the user is authenticated and has at least one of the roles.
    * @param roles Allowed roles for the user to have. If empty, any authenticated user is allowed.
    * @returns Express middleware
    */
   type AuthenticationHandler = (req: Request, res: Response, next: any) => void;

   /**
    * User object that is stored in the session.
    */
   interface RequestUser {
      username?: string;
      roles?: string[];
      id?: string;
   }

   /**
    * Augment the Express namespace with our custom types.
    */
   namespace Express {
    interface Session {
      user?: RequestUser;
    }  
   }
}
