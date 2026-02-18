import Grade from '../../models/Grade.js';
import Product from '../../models/Product.js';

export const createGrade = async (req, res) => {
    const { product, name, price, isActive } = req.body;
    if (!product || !name || price == null || price === '') {
        return res.status(400).json({ message: 'Product, name and price are required' });
    }
    try {
        const grade = await Grade.create({
            product,
            name: name.trim(),
            price: Number(price),
            isActive: isActive !== false,
        });
        if (!grade) {
            return res.status(400).json({ success: false, message: 'Failed to create grade' });
        }
        await Product.findByIdAndUpdate(product, { $push: { grades: grade._id } });
        return res.status(201).json({ success: true, data: grade, message: 'Grade created successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to create grade' });
    }
}   

export const getGrades = async (req, res) => {
    try {
        const grades = await Grade.find().populate('product', '_id');
        if (!grades) {
            return res.status(400).json({ success: false, message: 'Failed to get grades' });
        }
        return res.status(200).json({ success: true, data: grades, message: 'Grades fetched successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to get grades' });
    }
}

export const getGradeById = async (req, res) => {
    const { id } = req.params;
    try {
        const grade = await Grade.findById(id);
        if (!grade) {
            return res.status(400).json({ success: false, message: 'Grade not found' });
        }
        return res.status(200).json({ success: true, data: grade, message: 'Grade fetched successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to get grade' });
    }
}

export const updateGrade = async (req, res) => {
    const { id } = req.params;
    const { name, price, isActive } = req.body;
    if (!id || !name || price == null || price === '') {
        return res.status(400).json({ success: false, message: 'Name and price are required' });
    }
    try {
        const grade = await Grade.findByIdAndUpdate(
            id,
            { name: name.trim(), price: Number(price), isActive: isActive !== false },
            { new: true }
        );
        if (!grade) {
            return res.status(400).json({ success: false, message: 'Failed to update grade' });
        }
        return res.status(200).json({ success: true, data: grade, message: 'Grade updated successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to update grade' });
    }
}

export const deleteGrade = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: 'Grade id is required' });
    }
    try {
        const grade = await Grade.findById(id);
        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }
        const productId = grade.product;
        await Grade.findByIdAndDelete(id);
        if (productId) {
            await Product.findByIdAndUpdate(productId, { $pull: { grades: id } });
        }
        return res.status(200).json({ success: true, message: 'Grade deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to delete grade' });
    }
};