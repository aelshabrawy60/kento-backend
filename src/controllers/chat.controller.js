const chatService = require("../services/chat.service");

exports.getConversations = async (req, res) => {
    try {
        const conversations = await chatService.getConversations(req.user.id);
        res.json({ data: conversations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOrCreateConversation = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        if (!targetUserId) return res.status(400).json({ error: "targetUserId is required" });
        const conversation = await chatService.getOrCreateConversation(req.user.id, targetUserId);
        res.json({ data: conversation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await chatService.getMessages(conversationId, req.user.id);
        res.json({ data: messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
