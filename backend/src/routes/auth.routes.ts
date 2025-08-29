// src/routes/auth.routes.ts

import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

// Defines the endpoint: POST /api/auth/login
router.post('/auth/login', login);

export default router;