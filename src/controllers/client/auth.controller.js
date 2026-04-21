const authService = require("../../services/client/auth.service");
const { ApiError } = require("../../utils/apiError");

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.validated.body);
    res.status(201).json(user);
  } catch (e) {
    throw new ApiError(400, e.message);
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (e) {
    throw new ApiError(401, e.message);
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refresh(refreshToken);
    res.json(data);
  } catch (e) {
    throw new ApiError(401, e.message);
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ message: "Logged out" });
  } catch (e) {
    throw new ApiError(400, e.message);
  }
};


exports.verifyToken = async (req, res) => {
  // extract the token from the header
  try {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (!authHeader) {
      throw new Error("No token provided");
    }
    const token = authHeader.split(" ")[1];
    const user = await authService.verifyToken(token);
    res.json(user);
  } catch (e) {
    throw new ApiError(401, e.message);
  }
};