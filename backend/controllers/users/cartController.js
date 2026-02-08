import Cart from '../../models/cart.js';

export const getCart = async (req, res) => {
    try {
        const items = await Cart.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: items,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addToCart = async (req, res) => {
    const { product, productName, productImage, grade, colors, quantity, unitPrice, totalPrice } = req.body;
    if (!product || !quantity || totalPrice == null) {
        return res.status(400).json({ success: false, message: 'Product, quantity and totalPrice are required' });
    }
    try {
        const item = await Cart.create({
            user: req.user._id,
            product,
            productName: productName || '',
            productImage: productImage || null,
            grade: grade || null,
            colors: Array.isArray(colors) ? colors : [],
            quantity,
            unitPrice: unitPrice ?? 0,
            totalPrice,
        });
        res.status(201).json({
            success: true,
            data: item,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCart = async (req, res) => {
    const { id } = req.params;
    const { quantity, unitPrice } = req.body;
    if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }
    try {
        const item = await Cart.findOne({ _id: id, user: req.user._id });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }
        const price = unitPrice ?? item.unitPrice ?? 0;
        const total = price * quantity;
        const updated = await Cart.findByIdAndUpdate(id, { quantity, unitPrice: price, totalPrice: total }, { new: true });
        res.status(200).json({
            success: true,
            data: updated,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteFromCart = async (req, res) => {
    const { id } = req.params;
    try {
        const item = await Cart.findOneAndDelete({ _id: id, user: req.user._id });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        await Cart.deleteMany({ user: req.user._id });
        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};