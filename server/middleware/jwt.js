const jwt = require("jsonwebtoken"); //jwt token

function generateJWTToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  console.log("=== JWT MIDDLEWARE DEBUG ===");
  console.log("Authorization header:", token);
  console.log("Headers:", req.headers);
  
  if (!token) {
    console.log("No token found");
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT verification failed:", err);
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("JWT decoded successfully:", decoded);
    req.user = decoded;
    console.log("=== END JWT MIDDLEWARE DEBUG ===");
    next();
  });
}

module.exports = { verifyToken, generateJWTToken };
