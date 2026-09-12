// src/modules/settings/settings.routes.js
import { Router } from 'express';
import * as controller from './settings.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', controller.getSettings);
router.patch('/', controller.updateSettings);

router.get('/models', controller.listModels);
router.post('/models/test', controller.testModel);

export default router;