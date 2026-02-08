import Color from '../../models/Color.js';
import Product from '../../models/Product.js';

export const createColor = async (req, res) => {
    const { name, hexCode, product } = req.body;
    if (!name?.trim() || !hexCode?.trim() || !product) {
        return res.status(400).json({ success: false, message: 'Name, hexCode and product are required' });
    }
    try {
        const color = await Color.create({
            name: name.trim(),
            hexCode: hexCode.trim(),
            product,
        });
        await Product.findByIdAndUpdate(product, { $push: { colors: color._id } });
        return res.status(201).json({ success: true, data: color, message: 'Color created successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to create color' });
    }
};

export const getColors = async (req, res) => {
    try {
        const colors = await Color.find().populate('product', '_id');
        res.status(200).json({
            success: true,
            data: colors,
            message: 'Colors fetched successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getColor = async (req, res) => {
    const { id } = req.params;
    const color = await Color.findById(id);
    if (!color) {
        return res.status(404).json({ success: false, message: 'Color not found' });
    }
    return res.status(200).json({
        success: true,
        data: color,
        message: 'Color fetched successfully',
    });
};
 export const updateColor = async (req, res) => {
    const { id } = req.params;
    const { name, hexCode, product } = req.body;
    const color = await Color.findByIdAndUpdate(id, { name, hexCode, product }, { new: true });
    res.status(200).json({
        success: true,
        data: color,
        message: 'Color updated successfully',
    });
};
export const deleteColor = async (req, res) => {
    const { id } = req.params;
    const color = await Color.findById(id);
    if (color?.product) {
        await Product.findByIdAndUpdate(color.product, { $pull: { colors: id } });
    }
    await Color.findByIdAndDelete(id);
    return res.status(200).json({
        success: true,
        message: 'Color deleted successfully',
    });
};