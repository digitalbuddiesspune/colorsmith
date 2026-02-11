import express from 'express';
import { protect, adminOnly } from '../../middleware/auth.js';
import {
  createSuggestion,
  getMySuggestions,
  getAllSuggestions,
  updateSuggestionStatus,
} from '../../controllers/color/colorSuggestionController.js';

const router = express.Router();

// User routes
router.post('/color-suggestions', protect, createSuggestion);
router.get('/color-suggestions/mine', protect, getMySuggestions);

// Admin routes
router.get('/color-suggestions', protect, adminOnly, getAllSuggestions);
router.put('/color-suggestions/:id', protect, adminOnly, updateSuggestionStatus);

export default router;
