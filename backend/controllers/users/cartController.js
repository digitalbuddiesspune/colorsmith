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
    const { product, productName, productImage, grade, colors, quantity, unitPrice, totalPrice, minimumOrderQuantity } = req.body;
    if (!product || !quantity || totalPrice == null) {
        return res.status(400).json({ success: false, message: 'Product, quantity and totalPrice are required' });
    }
    try {
        const incomingColors = Array.isArray(colors) ? colors : [];

        // Build a match query for the same product + grade + colors combo
        const matchQuery = {
            user: req.user._id,
            product,
            'grade.id': grade?.id ?? null,
        };

        // Find all cart items that match product + user + grade, then check colors client-side
        const candidates = await Cart.find(matchQuery);

        // Sort helper: compare color id strings so order doesn't matter
        const sortedIds = (arr) =>
            arr.map((c) => String(c.id ?? c._id ?? '')).sort().join(',');

        const incomingSorted = sortedIds(incomingColors);

        const existing = candidates.find(
            (c) => sortedIds(c.colors) === incomingSorted
        );

        if (existing) {
            // Merge: add quantity, recalculate total
            const newQty   = existing.quantity + Number(quantity);
            const price    = unitPrice ?? existing.unitPrice ?? 0;
            const newTotal = price * newQty;

            const updated = await Cart.findByIdAndUpdate(
                existing._id,
                { quantity: newQty, unitPrice: price, totalPrice: newTotal },
                { new: true }
            );
            return res.status(200).json({ success: true, data: updated, merged: true });
        }

        // No matching item — create a fresh one
        const moq = Math.max(1, Number(minimumOrderQuantity) || 1);
        const item = await Cart.create({
            user: req.user._id,
            product,
            productName: productName || '',
            productImage: productImage || null,
            grade: grade || null,
            colors: incomingColors,
            quantity,
            unitPrice: unitPrice ?? 0,
            totalPrice,
            minimumOrderQuantity: moq,
        });
        res.status(201).json({ success: true, data: item, merged: false });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCart = async (req, res) => {
    const { id } = req.params;
    const { quantity, unitPrice } = req.body;
    try {
        const item = await Cart.findOne({ _id: id, user: req.user._id });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }
        const moq = item.minimumOrderQuantity ?? 1;
        const qty = Math.max(moq, Math.floor(Number(quantity)) || moq);
        if (!quantity || qty < moq) {
            return res.status(400).json({ success: false, message: `Quantity must be at least ${moq}` });
        }
        const price = unitPrice ?? item.unitPrice ?? 0;
        const total = price * qty;
        const updated = await Cart.findByIdAndUpdate(id, { quantity: qty, unitPrice: price, totalPrice: total }, { new: true });
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