import express from 'express';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../../controllers/users/addressController.js';
import { protect } from '../../middleware/auth.js';

const addressRouter = express.Router();

// All address routes require authentication
addressRouter.use(protect);

addressRouter.route('/').get(getAddresses).post(createAddress);
addressRouter.route('/:id').put(updateAddress).delete(deleteAddress);

export default addressRouter;