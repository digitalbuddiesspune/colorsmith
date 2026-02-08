import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, default: function() { return this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    subCategories: [{
      name: { type: String, required: true, trim: true },
    }]
  },
  { timestamps: true }
);


export default mongoose.model('Category', categorySchema);
