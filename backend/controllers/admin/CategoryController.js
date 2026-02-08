import Category from '../../models/Category.js';

export const createCategory = async (req, res) => {
  const { name, description, image, isActive, subCategories } = req.body;
  const category = await Category.create({ name, description, image, isActive, subCategories });
  if (!category) {
    return res.status(400).json({ message: 'Failed to create category' });
  }
  return res.status(201).json(category);
};

export const getCategories = async (req, res) => {
  const categories = await Category.find();
  if (!categories) {
    return res.status(400).json({ message: 'Failed to get categories' });
  }
  return res.status(200).json(categories);
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, image, isActive, subCategories } = req.body;
  const category = await Category.findByIdAndUpdate(id, { name, description, image, isActive, subCategories }, { new: true });
  if (!category) {
    return res.status(400).json({ message: 'Failed to update category' });
  }
  return res.status(200).json(category);
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return res.status(400).json({ message: 'Failed to delete category' });
  }
  return res.status(200).json({ message: 'Category deleted successfully' });
};  
