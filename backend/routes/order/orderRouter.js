import express from 'express';
import { 
  createRazorpayOrder, 
  verifyRazorpayPayment, 
  createOrder, 
  getOrders, 
  getOrderById, 
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats
} from '../../controllers/order/orderController.js';
import { protect, adminOnly } from '../../middleware/auth.js';

const orderRouter = express.Router();

// All routes require authentication
orderRouter.use(protect);

// User routes
orderRouter.post('/razorpay/create', createRazorpayOrder);
orderRouter.post('/razorpay/verify', verifyRazorpayPayment);
orderRouter.post('/', createOrder);
orderRouter.get('/', getOrders);
orderRouter.get('/:id', getOrderById);
orderRouter.put('/:id/cancel', cancelOrder);

// Admin routes
orderRouter.get('/admin/dashboard-stats', adminOnly, getDashboardStats);
orderRouter.get('/admin/all', adminOnly, getAllOrders);
orderRouter.put('/admin/:id', adminOnly, updateOrderStatus);

export default orderRouter;
