import express from 'express';
import { registerUser, userLogin, getMe, createUser, deleteUser, getUsers, updateUser } from '../../controllers/users/loginController.js';
import { protect } from '../../middleware/auth.js';

const userRouter = express.Router();

// Auth routes (public)
userRouter.post('/auth/register', registerUser);
userRouter.post('/auth/login', userLogin);

// Get current user (protected)
userRouter.get('/auth/me', protect, getMe);

// Legacy routes
userRouter.post('/create-user', createUser);
userRouter.post('/login', userLogin);
userRouter.get('/get-users', getUsers);
userRouter.put('/update-user/:id', updateUser);
userRouter.delete('/delete-user/:id', deleteUser);

export default userRouter;