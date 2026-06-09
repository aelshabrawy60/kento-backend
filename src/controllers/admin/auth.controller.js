const authService = require("../../services/admin/auth.service");

exports.login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refresh(refreshToken);
    res.json(data);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ message: "Logged out" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (!authHeader) throw new Error("No token provided");
    const token = authHeader.split(" ")[1];
    const user = await authService.verifyToken(token);
    res.json(user);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};
