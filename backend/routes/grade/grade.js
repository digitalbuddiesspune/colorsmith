import { Router } from 'express';
import { createGrade, getGradeById, getGrades, updateGrade } from '../../controllers/Grade/gradeControllers.js';

const gradeRouter = Router();

gradeRouter.route('/create-grade').post(createGrade);
gradeRouter.route('/get-grades').get(getGrades);
gradeRouter.route('/get-grade/:id').get(getGradeById);
gradeRouter.route('/update-grade/:id').put(updateGrade);

export default gradeRouter;