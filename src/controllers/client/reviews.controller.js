const { addReview } = require("../../services/client/reviews.service");
const { ApiError } = require("../../utils/apiError");

exports.addReview = async (req, res) => {
    try {
        const { vendorId, value, comment, mediaUrls } = req.body;
        const review = await addReview({ userId: req.user.id, vendorId, value, comment, mediaUrls });
        res.status(200).json(review);
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
}