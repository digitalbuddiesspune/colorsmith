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

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

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
app.get('/', (req, res) => {
  res.send('Color Smith API is ready');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
