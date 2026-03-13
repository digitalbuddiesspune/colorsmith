import mongoose from 'mongoose';

const colorSuggestionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, trim: true },
    hexCode: { type: String, required: true, trim: true },
    colorCode: { type: String, trim: true },
    notes: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('ColorSuggestion', colorSuggestionSchema);
