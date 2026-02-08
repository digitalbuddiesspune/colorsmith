import Admin from '../../models/admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'colorsmith-secret', { expiresIn: '7d' });

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  const token = generateToken(admin._id);
  const adminData = { _id: admin._id, name: admin.name, email: admin.email };
  return res.status(200).json({ success: true, token, admin: adminData });
};

export const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashedPassword });
    if (!admin) {
        return res.status(400).json({ message: 'Failed to create admin' });
    }
    return res.status(201).json({ success: true, data: admin, message: 'Admin created successfully' });
};

export const getAdmins = async (req, res) => {
    const admins = await Admin.find();
    if (!admins) {
        return res.status(400).json({
            success: false,
            message: 'Failed to get admins'
        });
    }
    return res.status(200).json({ success: true, data: admins, message: 'Admins fetched successfully' });
};

export const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const admin = await Admin.findByIdAndUpdate(id, { name, email, password }, { new: true });
    if (!admin) {
        return res.status(400).json({ success: false, message: 'Failed to update admin' });
    }
    return res.status(200).json({ success: true, data: admin, message: 'Admin updated successfully' });
};

export const deleteAdmin = async (req, res) => {
    const { id } = req.params;
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
        return res.status(400).json({ success: false, message: 'Failed to delete admin' });
    }
    return res.status(200).json({ success: true, data: admin, message: 'Admin deleted successfully' });
};