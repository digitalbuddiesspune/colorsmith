import express from 'express';
import { loginAdmin, createAdmin, getAdmins, updateAdmin, deleteAdmin } from '../../controllers/admin/adminController.js';

const adminRouter = express.Router();

adminRouter.route('/admin-login').post(loginAdmin);
adminRouter.route('/create-admin').post(createAdmin);
adminRouter.route('/get-admins').get(getAdmins);
adminRouter.route('/update-admin/:id').put(updateAdmin);
adminRouter.route('/delete-admin/:id').delete(deleteAdmin);

export default adminRouter;