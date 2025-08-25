// src/app.ts

import express from 'express';
import cors from 'cors';
import medicineRoutes from './routes/medicine.routes';
import customerRoutes from './routes/customer.routes';
import saleRoutes from './routes/sale.routes';
import supplierRoutes from './routes/supplier.routes';
import purchaseRoutes from './routes/purchase.routes'; // <-- 1. Import purchase routes

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- API ROUTES ---
app.use('/api', medicineRoutes);
app.use('/api', customerRoutes);
app.use('/api', saleRoutes);
app.use('/api', supplierRoutes);
app.use('/api', purchaseRoutes); // <-- 2. Tell the app to use them

export default app;