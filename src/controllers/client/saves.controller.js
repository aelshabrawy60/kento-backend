const { ApiError } = require("../../utils/apiError.js")
const { getSavedPosts, savePost, unSavePost } = require("../../services/client/saves.service.js")

exports.getSavedPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const savedPosts = await getSavedPosts({ userId });
        res.status(200).json({ savedPosts });
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
}

exports.savePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.body;
        const savedPost = await savePost({ userId, postId });
        res.status(200).json({ savedPost });
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
}

exports.unSavePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.body;
        const unSavedPost = await unSavePost({ userId, postId });
        res.status(200).json({ unSavedPost });
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
}
