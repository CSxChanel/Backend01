// middlewares/authMiddleware.js

const response = require("../helpers/response"); // sesuaikan path jika beda
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return response(res, 401, false, "Akses ditolak, token tidak sesuai.");
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
        return response(res, 401, false, "Akses ditolak, token tidak ada");
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return response(res, 401, false, "Token tidak valid", null, {
            message: err.message
        });
    }
};

// Cek apakah user punya role admin
const authorize = role => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return response(
                res,
                403,
                false,
                "Akses ditolak",
                "hanya Admin yang bisa akses."
            );
        }
        next();
    };
};

module.exports = { authenticate, authorize };
