import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db_connection.js';
import categoryRoutes from './routes/admin/categoryRoute.js';
import adminRoutes from './routes/admin/adminRoute.js';
import userRouter from './routes/user/userRoutes.js';
import productRouter from './routes/Product/productRoute.js';
import gradeRouter from './routes/grade/grade.js';
import colorRouter from './routes/color/colorRouter.js';
import cartRouter from './routes/user/cartRouter.js';
import addressRouter from './routes/user/addressRouter.js';
import orderRouter from './routes/order/orderRouter.js';
import colorSuggestionRouter from './routes/color/colorSuggestionRoute.js';
import colorSetRouter from './routes/color/colorSetRoute.js';
import uploadRouter from './routes/uploadRoute.js';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Allow frontend origins (CORS). When nginx returns 413, its response has no CORS headers — fix 413 in nginx so requests reach this app.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://www.color-smith.com',
  'https://color-smith.com',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
// Allow larger payloads (JSON/urlencoded). For multipart uploads, multer limits apply per route.
// If you get 413 behind nginx, add: client_max_body_size 10M;
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/v1', userRouter);
app.use('/api/v1', categoryRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1', productRouter);
app.use('/api/v1', gradeRouter);
app.use('/api/v1', colorRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/address', addressRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1', colorSuggestionRouter);
app.use('/api/v1', colorSetRouter);
app.use('/api/v1', uploadRouter);
app.get('/', (req, res) => {
  res.send('Color Smith API is ready');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
