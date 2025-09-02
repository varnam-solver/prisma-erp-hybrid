/// <reference path="../types/express.d.ts" />

// src/app.ts

import express from 'express';
import cors from 'cors';
import medicineRoutes from './routes/medicine.routes';
import customerRoutes from './routes/customer.routes';
import saleRoutes from './routes/sale.routes';
import supplierRoutes from './routes/supplier.routes';
import purchaseRoutes from './routes/purchase.routes';
import authRoutes from './routes/auth.routes'; // <-- 1. Import auth routes
import dashboardRoutes from './routes/dashboard.routes'; // <-- 1. Import dashboard routes


const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- API ROUTES ---
app.use('/api', authRoutes); // <-- 2. Add auth routes
app.use('/api', medicineRoutes);
app.use('/api', customerRoutes);
app.use('/api', saleRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api', purchaseRoutes);
app.use('/api/dashboard', dashboardRoutes); // <-- 2. Add dashboard routes

export default app;