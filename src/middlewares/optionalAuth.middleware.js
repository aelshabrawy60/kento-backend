const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const { userId, role } = decoded;
        req.user = { id: userId, role };
    } catch {
        req.user = null; // ignore invalid token
    }

    next();
};