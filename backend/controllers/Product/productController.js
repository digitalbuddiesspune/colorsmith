import Product from '../../models/Product.js';
import ProductGradeColor from '../../models/ProductGradeColor.js';
import Grade from '../../models/Grade.js';
import Color from '../../models/Color.js';

export const createProduct = async (req, res) => {
    const { name, category, description, image, isActive, grades, colors, minimumOrderQuantity } = req.body;
    if (!name || !category || !image || minimumOrderQuantity == null || minimumOrderQuantity === '') {
        return res.status(400).json({ message: 'Name, category, image and minimum order quantity are required' });
    }
    const gradeIds = Array.isArray(grades) ? grades : [];
    const colorIds = Array.isArray(colors) ? colors : [];
    try {
        const product = await Product.create({
            name,
            category,
            description: description || undefined,
            image,
            isActive: isActive !== false,
            grades: gradeIds,
            colors: colorIds,
            minimumOrderQuantity: Number(minimumOrderQuantity),
        });
        if (!product) {
            return res.status(400).json({ message: 'Failed to create product' });
        }
        return res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
    } catch (error) {
        return res.status(400).json({ message: 'Failed to create product' });
    }
};

export const getProducts = async (req, res) => {
    try {
    const products = await Product.find();
    if (!products) {
        return res.status(400).json({ message: 'No products found' });
    }
    return res.status(200).json({ success: true, data: products, message: 'Products fetched successfully' });
    } catch (error) {
        return res.status(400).json({ message: 'Failed to fetch products' });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id)
            .populate('category')
            .lean();
        if (!product) {
            return res.status(400).json({ message: 'Product not found' });
        }
        // Load grades and colors from Grade/Color collections (same as admin) so they always match
        const [grades, colors, availability] = await Promise.all([
            Grade.find({ product: id }).lean(),
            Color.find({ product: id }).lean(),
            ProductGradeColor.find({ product: id })
                .populate('grade')
                .populate('color')
                .lean(),
        ]);
        const data = { ...product, grades, colors, availability };
        return res.status(200).json({ success: true, data, message: 'Product fetched successfully' });
    } catch (error) {
        return res.status(400).json({ message: 'Failed to fetch product' });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, category, description, image, isActive, grades, colors, minimumOrderQuantity } = req.body;
    if (!name || !category || !image || minimumOrderQuantity == null || minimumOrderQuantity === '') {
        return res.status(400).json({ message: 'Name, category, image and minimum order quantity are required' });
    }
    const gradeIds = Array.isArray(grades) ? grades : [];
    const colorIds = Array.isArray(colors) ? colors : [];
    try {
        const product = await Product.findByIdAndUpdate(
            id,
            {
                name,
                category,
                description: description || undefined,
                image,
                isActive: isActive !== false,
                grades: gradeIds,
                colors: colorIds,
                minimumOrderQuantity: Number(minimumOrderQuantity),
            },
            { new: true }
        );
        if (!product) {
            return res.status(400).json({ message: 'Failed to update product' });
        }
        return res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
    } catch (error) {
        return res.status(400).json({ message: 'Failed to update product' });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(400).json({ message: 'Failed to delete product' });
        }
        return res.status(200).json({ success: true, data: product, message: 'Product deleted successfully' });
    } catch (error) {
        return res.status(400).json({ message: 'Failed to delete product' });
    }
};