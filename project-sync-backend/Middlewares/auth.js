const jwt = require('jsonwebtoken')
const { userJwtSecret } = require('../config')
const User = require('../Models/user')

/**
 * Authentication middleware to verify user tokens
 */
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.userToken;

        if (!token) {
            return res.status(403).json({ responseCode: 403, status: "FORBIDDEN", message: "Authentication required" });
        }

        const decoded = jwt.verify(token, userJwtSecret);
        req.userId = decoded.data;

        // Fetch the complete user object and attach it to the request
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({ responseCode: 404, status: "ERROR", message: "User not found" });
            }
            req.user = user;
            console.log('User authenticated:', user._id.toString());
        } catch (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ responseCode: 500, status: "ERROR", message: "Error fetching user data" });
        }

        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ responseCode: 401, status: "UNAUTHORIZED", message: "Invalid token" });
    }
}

/**
 * Logout middleware to clear user cookies
 */
const logoutMiddleware = (req, res) => {
    try {
        res.clearCookie("userToken");
        return res.status(200).json({ responseCode: 200, status: "SUCCESS", message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ responseCode: 500, status: "ERROR", message: "Server error during logout" });
    }
};

module.exports = {
    authMiddleware,
    logoutMiddleware
} 