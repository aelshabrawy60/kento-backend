const express = require("express");
const chatController = require("../controllers/chat.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/conversations", chatController.getConversations);
router.post("/conversations", chatController.getOrCreateConversation);
router.get("/conversations/:conversationId/messages", chatController.getMessages);

module.exports = router;
