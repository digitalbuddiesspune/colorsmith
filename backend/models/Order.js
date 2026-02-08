import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: { type: String },
  grade: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' },
    name: { type: String },
    price: { type: Number },
  },
  colors: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Color' },
    name: { type: String },
    hexCode: { type: String },
  }],
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'India' },
    phone: { type: String, required: true },
  },
  subtotal: { type: Number, required: true },
  sgstAmount: { type: Number, default: 0 },
  cgstAmount: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 }, // Total GST (SGST + CGST)
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'Razorpay'], required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  notes: { type: String },
}, { timestamps: true });

// Generate order number before saving
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `CS${year}${month}${day}${random}`;
  }
});

export default mongoose.model('Order', orderSchema);
