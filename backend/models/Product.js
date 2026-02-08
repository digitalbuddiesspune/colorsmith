import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    image: { type: String, required: true },
    grades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grade', required: true }],
    colors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true }],
    minimumOrderQuantity: { type: Number, required: true },
    stock: { type: Number, default: 0 }, // Available stock quantity
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
