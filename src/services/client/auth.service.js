const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  generateAccessToken,
  generateRefreshToken,
  generateStreamChatToken
} = require("../../utils/token");
const { ApiError } = require("../../utils/apiError");

exports.register = async ({ name, email, password }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new ApiError(400, "Email already in use");

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "CLIENT" },
  });

  // create a corresponding client profile
  await prisma.client.create({
    data: {
      userId: user.id,
    },
  });

  // generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const streamChatToken = generateStreamChatToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  delete user.password;
  return { user, accessToken, refreshToken, streamChatToken };
};

exports.login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const streamChatToken = generateStreamChatToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  delete user.password;

  return { user, accessToken, refreshToken, streamChatToken };
};

exports.refresh = async (token) => {
  if (!token) throw new Error("No refresh token");

  const stored = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!stored) throw new Error("Invalid refresh token");

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token } });
    throw new Error("Expired refresh token");
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  // ROTATION 🔥
  await prisma.refreshToken.delete({ where: { token } });

  var user = {
    id: decoded.userId,
    role: decoded.role,
  }
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
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
};

exports.verifyToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  return user;
};