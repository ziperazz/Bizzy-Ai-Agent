// src/modules/tasks/task.routes.js
import { Router } from 'express';
import * as controller from './task.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.route('/').post(controller.createTask).get(controller.listTasks);
router
    .route('/:id')
    .get(controller.getTask)
    .patch(controller.updateTask)
    .delete(controller.deleteTask);

export default router;