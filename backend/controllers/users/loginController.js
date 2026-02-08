import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'colorsmith-secret', { expiresIn: '30d' });
};

// Register new user
export const registerUser = async (req, res) => {
    const { name, email, password, company } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }
        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            company: company || undefined,
        });
        const token = generateToken(newUser._id);
        return res.status(201).json({
            success: true,
            token,
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            company: newUser.company,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to register user' });
    }
};

// Login user
export const userLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    try {
        const foundUser = await User.findOne({ email: email.toLowerCase() });
        if (!foundUser) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const isMatch = await foundUser.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const token = generateToken(foundUser._id);
        return res.status(200).json({
            success: true,
            token,
            _id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role,
            company: foundUser.company,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Login failed' });
    }
};

// Get current user (protected route)
export const getMe = async (req, res) => {
    try {
        const foundUser = await User.findById(req.user._id).select('-password');
        if (!foundUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            _id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role,
            company: foundUser.company,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Change password (protected route)
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    try {
        const foundUser = await User.findById(req.user._id);
        if (!foundUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isMatch = await foundUser.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        foundUser.password = newPassword;
        await foundUser.save();
        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to change password' });
    }
};

// Legacy: Create user (alias for register)
export const createUser = registerUser;

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json({ success: true, data: users, message: 'Users fetched successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, company } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, email, company },
            { new: true }
        ).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, data: updatedUser, message: 'User updated successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};