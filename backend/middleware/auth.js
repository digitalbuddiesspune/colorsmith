import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/admin.js';

// Authenticate any user (regular user OR admin)
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'colorsmith-secret');

    // First try to find in Admin collection
    const admin = await Admin.findById(decoded.id).select('-password');
    if (admin) {
      req.user = admin;
      req.isAdmin = true;
      return next();
    }

    // Then try User collection
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
      req.isAdmin = false;
      return next();
    }

    return res.status(401).json({ message: 'User not found' });
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

// Only allow admins from the Admin collection
export const adminOnly = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
