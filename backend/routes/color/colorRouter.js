import express from 'express';
import { createColor, getColors, getColor, updateColor, deleteColor } from '../../controllers/color/colorController.js';

const colorRouter = express.Router();

colorRouter.route('/create-color').post(createColor);
colorRouter.route('/get-colors').get(getColors);
colorRouter.route('/get-color/:id').get(getColor);
colorRouter.route('/update-color/:id').put(updateColor);
colorRouter.route('/delete-color/:id').delete(deleteColor);

export default colorRouter;