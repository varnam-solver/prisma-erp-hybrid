// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request type to include our custom user payload
export interface AuthenticatedRequest extends Request {
  user?: {
    tenantId: string;
    staffId: string;
  };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  // 1. Check if the request has an Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Get the token from the header
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET;

      // --- THIS IS THE FIX ---
      // 3. Ensure both the token and the secret key exist before verifying
      if (token && secret) {
        // 4. Verify the token
        const decoded = jwt.verify(token, secret);

        console.log("Decoded JWT:", decoded);

        if (typeof decoded === "object" && decoded !== null && "tenantId" in decoded && "staffId" in decoded) {
          req.user = decoded as { tenantId: string; staffId: string };
          next();
        } else {
          res.status(401).json({ error: "Invalid token payload" });
        }
      } else {
        // If token or secret is missing, throw an error
        throw new Error('Token or secret is missing');
      }
      // --- END OF FIX ---

    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};
