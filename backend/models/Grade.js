import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, default: function () { return this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }, trim: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Grade', gradeSchema);
