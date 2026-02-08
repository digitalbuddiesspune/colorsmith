import express from 'express';
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../../controllers/Product/productController.js';
const productRouter = express.Router();

productRouter.route('/create-product').post(createProduct);
productRouter.route('/get-products').get(getProducts);
productRouter.route('/get-product/:id').get(getProductById);
productRouter.route('/update-product/:id').put(updateProduct);
productRouter.route('/delete-product/:id').delete(deleteProduct);

export default productRouter;