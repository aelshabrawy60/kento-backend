const onboardService = require("../../services/vendor/onboard.service");

exports.onboard = async (req, res) => {
    try {
        // get the user id from the auth middleware
        const userId = req.user.id;

        const { name, phone, region, category, experience, portfolioUrl, price, type, about, profilePicture } = req.body;

        await onboardService.onboard(userId, { name, phone, region, category, experience, portfolioUrl, price, type, about, profilePicture });

        res.status(200).json({ message: "Onboarding completed successfully" });
    } catch (error) {
        console.error("Onboarding error:", error);
        res.status(500).json({ error: "Failed to complete onboarding" });
    }
};