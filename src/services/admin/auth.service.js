const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/token");

exports.login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");
  if (user.role !== "ADMIN") throw new Error("Access denied");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  delete user.password;
  return { user, accessToken, refreshToken };
};

exports.refresh = async (token) => {
  if (!token) throw new Error("No refresh token");

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored) throw new Error("Invalid refresh token");

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token } });
    throw new Error("Expired refresh token");
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  // Token rotation
  await prisma.refreshToken.delete({ where: { token } });

  const user = { id: decoded.userId, role: decoded.role };
  const newRefreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: decoded.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const newAccessToken = generateAccessToken(user);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

exports.logout = async (token) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};

exports.verifyToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
};
