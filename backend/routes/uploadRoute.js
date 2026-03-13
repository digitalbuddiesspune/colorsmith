import express from 'express';
import multer from 'multer';
import { uploadImage, uploadSuggestionImage } from '../controllers/uploadController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();
const storage = multer.memoryStorage();

const commonFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Use JPEG, PNG, GIF, or WebP.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: commonFileFilter,
});

// Suggestion images: allow up to 10 MB so clients can upload high‑res reference photos
const uploadSuggestion = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: commonFileFilter,
});

router.post('/upload-image', protect, adminOnly, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Max 5 MB.' });
      }
      return res.status(400).json({ success: false, message: err.message || 'Invalid file' });
    }
    next();
  });
}, uploadImage);

router.post('/upload-suggestion-image', protect, (req, res, next) => {
  uploadSuggestion.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Max 10 MB.' });
      }
      return res.status(400).json({ success: false, message: err.message || 'Invalid file' });
    }
    next();
  });
}, uploadSuggestionImage);

export default router;
