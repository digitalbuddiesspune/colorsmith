import mongoose from 'mongoose';

const productGradeColorSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    grade: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', required: true },
    color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true },
    status: { type: String, enum: ['available', 'out_of_stock', 'discontinued'], default: 'available' },
  },
  { timestamps: true }
);

productGradeColorSchema.index({ product: 1, grade: 1, color: 1 }, { unique: true });

export default mongoose.model('ProductGradeColor', productGradeColorSchema);
