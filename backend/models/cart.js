import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String },
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
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartItemSchema);

export default Cart;