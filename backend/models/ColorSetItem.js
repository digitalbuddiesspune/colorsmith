import mongoose from 'mongoose';

const colorSetItemSchema = new mongoose.Schema(
  {
    colorSet: { type: mongoose.Schema.Types.ObjectId, ref: 'ColorSet', required: true },
    color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

colorSetItemSchema.index({ colorSet: 1, color: 1 }, { unique: true });

export default mongoose.model('ColorSetItem', colorSetItemSchema);
