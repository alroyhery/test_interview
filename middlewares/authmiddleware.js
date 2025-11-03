// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: 108,
      message: 'Authorization header missing'
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      status: 108,
      message: 'Invalid authorization format'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id_regis, email }
    next();
  } catch (err) {
    return res.status(401).json({
      status: 108,
      message: 'Token tidak tidak valid atau kadaluwarsa'
    });
  }
}

module.exports = authMiddleware;
