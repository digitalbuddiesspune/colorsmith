import express from 'express';
import { protect } from '../../middleware/auth.js';
import {
  list,
  get,
  create,
  update,
  remove,
  productColors,
} from '../../controllers/color/colorSetController.js';

const router = express.Router();

router.get('/color-sets', protect, list);
router.get('/color-sets/product/:productId/colors', productColors);
router.get('/color-sets/:id', protect, get);
router.post('/color-sets', protect, create);
router.put('/color-sets/:id', protect, update);
router.delete('/color-sets/:id', protect, remove);

export default router;
