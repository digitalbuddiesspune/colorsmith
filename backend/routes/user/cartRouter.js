import express from 'express';
import { addToCart, clearCart, deleteFromCart, getCart, updateCart } from '../../controllers/users/cartController.js';
import { protect } from '../../middleware/auth.js';

const cartRouter = express.Router();

// All cart routes require authentication
cartRouter.use(protect);

cartRouter.route('/').get(getCart).post(addToCart);
cartRouter.route('/clear').delete(clearCart); // must be before /:id
cartRouter.route('/:id').put(updateCart).delete(deleteFromCart);

export default cartRouter;