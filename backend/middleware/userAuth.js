import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {

    // Get token from headers
    const token = req.headers.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login again.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId =
      decoded && typeof decoded === "object" && decoded.id
        ? String(decoded.id)
        : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session. Please login again.",
      });
    }

    req.userId = userId;
    next();

  } catch (error) {

    console.log("AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });

  }
};

export default userAuth;