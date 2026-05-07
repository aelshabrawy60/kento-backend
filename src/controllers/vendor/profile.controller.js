const profileService = require("../../services/vendor/profile.service");

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await profileService.getProfile(userId);

        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedProfile = await profileService.updateProfile(userId, req.body);

        res.status(200).json({
            message: "Profile updated successfully",
            profile: updatedProfile
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};
