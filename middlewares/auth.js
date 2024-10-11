import TryCatch from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

export const isUserAuthenticated = TryCatch(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({
      success: false,
      message: "Please login to access this resource",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token is missing",
    });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decodedData.id;
    req.user = decodedData;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
});
