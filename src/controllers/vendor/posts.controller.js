const { ApiError } = require("../../utils/apiError");
const postsService = require("../../services/vendor/posts.service");



exports.createPost = async (req, res) => {
  try {
    const { hashtags, mediaUrls } = req.body;
    const userId = req.user.id; // Assuming the authenticated user's ID is available in req.user
    const post = await postsService.createPost({ userId, hashtags, mediaUrls });
    res.status(201).json(post);
  }catch (error) {
    console.error("Error creating post:", error);
    throw new ApiError("Failed to create post", 500);
  }
}
