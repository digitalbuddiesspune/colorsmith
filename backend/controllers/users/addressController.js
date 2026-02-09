import Address from '../../models/address.js';

const validateAddress = (body) => {
    const errors = [];
    const { name, address, city, state, zip, phone } = body;

    if (!name || name.trim().length < 2) errors.push('Full name is required (at least 2 characters).');
    if (name && !/^[a-zA-Z\s.'\-]+$/.test(name.trim())) errors.push('Name contains invalid characters.');

    if (!address || address.trim().length < 10) errors.push('Street address must be at least 10 characters.');

    if (!city || city.trim().length < 2) errors.push('City is required (at least 2 characters).');
    if (city && !/^[a-zA-Z\s'\-]+$/.test(city.trim())) errors.push('City contains invalid characters.');

    if (!state || state.trim().length < 2) errors.push('State is required.');

    if (!zip || !/^\d{6}$/.test(zip.trim())) errors.push('PIN code must be exactly 6 digits.');

    if (!phone) {
        errors.push('Phone number is required.');
    } else {
        const digits = phone.replace(/\D/g, '');
        const isValid = (digits.length === 10 && /^[6-9]/.test(digits)) || (digits.length === 12 && digits.startsWith('91'));
        if (!isValid) errors.push('Enter a valid 10-digit Indian mobile number.');
    }

    return errors;
};

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
    const errors = validateAddress(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors.join(' ') });
    }
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
    const errors = validateAddress(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors.join(' ') });
    }
    try {
        const address = await Address.findByIdAndUpdate(id, req.body, { new: true });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        res.status(200).json({
            success: true,
            address
        });
    } catch (error) {
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