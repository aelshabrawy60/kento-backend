const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = decoded; 
    // { userId, role }
    // get the user id and role from the token and attach it to the request object for use in controllers
    const { userId, role } = decoded;
    req.user = { id: userId, role };

    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};