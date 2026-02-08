import express from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory } from '../../controllers/admin/CategoryController.js';

const router = express.Router();

// No authentication - all routes are public
router.route('/create-category').post(createCategory);
router.route('/get-categories').get(getCategories);
router.route('/update-category/:id').put(updateCategory);
router.route('/delete-category/:id').delete(deleteCategory);

export default router;