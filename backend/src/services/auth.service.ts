// src/services/auth.service.ts

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db'; // Use the shared client

// --- Login a User ---
export const loginUser = async (email: string, password: string) => {
  // 1. Find the user by their email using findFirst
  const user = await prisma.users.findFirst({
    where: { email },
  });

  // 2. Check if the user exists AND has a password. This is the fix.
  if (!user || !user.encrypted_password) {
    // We throw the same generic error for security reasons.
    throw new Error('Invalid email or password');
  }

  // 3. Compare the provided password with the hashed password in the database
  const isPasswordValid = await bcrypt.compare(password, user.encrypted_password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // 4. Find the corresponding staff profile to get the tenant_id
  const staffProfile = await prisma.staff.findUnique({
    where: { id: user.id },
  });

  if (!staffProfile) {
    throw new Error('User does not have a staff profile.');
  }

  // 5. Create a secure token (JWT)
  const tokenPayload = {
    userId: user.id,
    staffId: staffProfile.id,
    tenantId: staffProfile.tenant_id,
    roleId: staffProfile.role_id,
  };
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
      throw new Error('JWT_SECRET is not defined in the environment variables.');
  }

  const token = jwt.sign(tokenPayload, secret, {
    expiresIn: '1d', // Token will be valid for 1 day
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: staffProfile.full_name,
      tenantId: staffProfile.tenant_id,
    },
  };
};
