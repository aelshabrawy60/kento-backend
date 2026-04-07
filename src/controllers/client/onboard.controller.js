const onboardService = require("../../services/client/onboard.service");

exports.onboard = async (req, res) => {
    try {
        // get the user id from the auth middleware
        const userId = req.user.id;

        const { name, phone, region } = req.validated.body;

        await onboardService.onboard(userId, { name, phone, region });

        res.status(200).json({ message: "Onboarding completed successfully" });
    } catch (error) {
        console.error("Onboarding error:", error);
        res.status(500).json({ error: "Failed to complete onboarding" });
    }
};