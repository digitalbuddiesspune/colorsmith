import Address from '../../models/address.js';

export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id });
        res.status(200).json({
            success: true,
            addresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAddress = async (req, res) => {
    try {
        const address = await Address.create({ user: req.user._id, ...req.body });
        res.status(201).json({
            success: true,
            address
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAddress = async (req, res) => {
    const { id } = req.params;
    try {
        const address = await Address.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({
            success: true,
            address
        })}
        catch (error) {
            res.status(500).json({ message: error.message });
        }
};

export const deleteAddress = async (req, res) => {
    const { id } = req.params;
    try {
        await Address.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};