// src/modules/chat/chat.routes.js
import { Router } from 'express';
import * as controller from './chat.controller.js';
import * as streamController from './chat.stream.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', controller.createConversation);
router.get('/', controller.listConversations);
router.get('/:id/messages', controller.getMessages);

// پیام عادی (JSON)
router.post('/:id/messages', controller.sendMessage);

// پیام با استریم (SSE)
router.post('/:id/messages/stream', streamController.streamMessage);

export default router;