import Order from '../../models/Order.js';
import Cart from '../../models/cart.js';
import Product from '../../models/Product.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy initialize Razorpay (to avoid startup errors when env vars not set)
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// Create Razorpay order (for online payment)
export const createRazorpayOrder = async (req, res) => {
  try {
    // Fail fast with clear message if credentials missing (common in production)
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please contact support.',
      });
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const amountPaise = Math.round(Number(amount) * 100);
    if (amountPaise < 100) {
      return res.status(400).json({ success: false, message: 'Amount must be at least ₹1' });
    }

    const options = {
      amount: amountPaise, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const rawMsg = error.message || error.error?.description || 'Failed to create payment order';
    const isAuthFailed =
      rawMsg.toLowerCase().includes('authentication failed') ||
      error.statusCode === 401 ||
      error.error?.code === 'BAD_REQUEST_AUTHENTICATION_FAILED';

    const msg = isAuthFailed
      ? 'Invalid Razorpay API keys. Ensure Key ID and Key Secret are a matching pair (both Test or both Live) and have no extra spaces.'
      : rawMsg;
    const status = error.statusCode || error.status || 500;
    console.error('Razorpay order creation error:', {
      message: rawMsg,
      code: error.code,
      statusCode: error.statusCode,
      hint: isAuthFailed ? 'Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are from the same key pair in Razorpay Dashboard.' : undefined,
      full: error,
    });
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      message: msg,
    });
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  }
};

// Create order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      items, 
      shippingAddress, 
      subtotal,
      sgstAmount,
      cgstAmount,
      gstAmount, 
      grandTotal, 
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      notes 
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    // For Razorpay, verify payment before creating order
    if (paymentMethod === 'Razorpay') {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Payment details are required for online payment' });
      }

      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    // Create order
    const order = new Order({
      user: userId,
      items: items.map(item => ({
        product: item.productId || item.product,
        productName: item.productName,
        productImage: item.productImage,
        grade: item.grade,
        colors: item.colors,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      shippingAddress,
      subtotal,
      sgstAmount: sgstAmount || subtotal * 0.09, // Default 9% SGST
      cgstAmount: cgstAmount || subtotal * 0.09, // Default 9% CGST
      gstAmount: gstAmount || subtotal * 0.18, // Default 18% total GST
      grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'Razorpay' ? 'paid' : 'pending',
      razorpayOrderId: razorpayOrderId || undefined,
      razorpayPaymentId: razorpayPaymentId || undefined,
      razorpaySignature: razorpaySignature || undefined,
      orderStatus: 'confirmed',
      notes,
    });

    await order.save();

    // Clear user's cart after successful order
    await Cart.deleteMany({ user: userId });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        shippingAddress: order.shippingAddress,
        subtotal: order.subtotal,
        sgstAmount: order.sgstAmount,
        cgstAmount: order.cgstAmount,
        gstAmount: order.gstAmount,
        grandTotal: order.grandTotal,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create order' });
  }
};

// Get user's orders
export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate('items.product', 'name image')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel order (only if not shipped)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (['shipped', 'delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel shipped or delivered orders' });
    }

    order.orderStatus = 'cancelled';
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded'; // Mark for refund processing
    }
    await order.save();

    return res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(query);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Today's orders count
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    // Order counts by status
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'confirmed' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Monthly sales data for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$grandTotal' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format monthly sales data with month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create array for last 12 months with 0 values as default
    const salesData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const found = monthlySales.find(s => s._id.year === year && s._id.month === month);
      
      salesData.push({
        month: monthNames[month - 1],
        year: year,
        sales: found ? found.totalSales : 0,
        orders: found ? found.orderCount : 0
      });
    }

    // Today's revenue
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lt: endOfDay },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    // Total revenue (all time, excluding cancelled)
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        todayOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlySales: salesData
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousOrderStatus = order.orderStatus;

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // Reduce product stock when order is confirmed (only if transitioning to confirmed)
    if (orderStatus === 'confirmed' && previousOrderStatus !== 'confirmed') {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } },
            { new: true }
          );
        }
      }
    }

    // Restore product stock if order is cancelled (and was previously confirmed or beyond)
    if (orderStatus === 'cancelled' && ['confirmed', 'processing', 'shipped'].includes(previousOrderStatus)) {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            { new: true }
          );
        }
      }
    }

    await order.save();

    return res.status(200).json({ success: true, message: 'Order updated successfully', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
