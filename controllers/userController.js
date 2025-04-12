//constrollers/userControler
const { pool, db } = require("../config/db");
const bcrypt = require("bcryptjs");
const response = require("../helpers/response");

// UNTUK TES CONEKSI KE DATABASE
const testConnection = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT NOW() AS time");
        response(res, 200, true, "Database connected!", result[0]);
    } catch (error) {
        response(res, 500, false, "Failed to connect to database", null, {
            message: error.message,
            code: error.code
        });
    }
};

// UNTUK RUBAH PASSWORD
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
            userId
        ]);

        const user = rows[0];
        if (!user) {
            return response(res, 404, false, "User tidak ditemukan!");
        }

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            return response(res, 401, false, "Password lama salah!");
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [
            hashed,
            userId
        ]);

        return response(res, 200, true, "Password berhasil diubah");
    } catch (error) {
        console.error(error);
        return response(res, 500, false, "Gagal mengubah password!", null, {
            message: error.message
        });
    }
};

// GET /api/user/profile
const userProfile = async (req, res) => {
    const userId = req.user.id;
    const connection = await db();
    const [rows] = await connection.execute(
        "SELECT username, email, created_at, role FROM users WHERE id = ?",
        [userId]
    );

    if (rows.length === 0) {
        return response(res, 404, false, "User tidak ditemukan");
    }

    response(res, 200, true, "Berhasil ambil profil", rows[0]);
};

// GET /users?page=2&limit=5&search=user
const getAllUser = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * limit;

        // Search query (username atau email)
        const searchQuery = `%${search}%`;

        // Hitung total data
        const [countResult] = await pool.query(
            "SELECT COUNT(*) AS total FROM users WHERE username LIKE ? OR email LIKE ?",
            [searchQuery, searchQuery]
        );
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Ambil data dengan pagination
        const [users] = await pool.query(
            "SELECT username, email, role, created_at FROM users WHERE username LIKE ? OR email LIKE ? LIMIT ? OFFSET ?",
            [searchQuery, searchQuery, parseInt(limit), parseInt(offset)]
        );

        response(res, 200, true, "Data berhasil ditampilkan!", {
            users,
            currentPage: parseInt(page),
            totalPages,
            totalData: total
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        response(res, 500, false, "Internal Server Error", null, {
            message: error.message
        });
    }
};

// DELETE /api/user/delete/:id ADMIN delet users by-id
const deleteUserByAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
            id
        ]);

        if (result.affectedRows === 0) {
            return response(res, 404, false, "User tidak ditemukan");
        }

        return response(res, 200, true, "User berhasil dihapus oleh admin");
    } catch (error) {
        return response(res, 500, false, "Gagal menghapus user", null, {
            message: error.message
        });
    }
};

// DELETE /api/user/delete-account USER delet akunnya sendiri
const deleteOwnAccount = async (req, res) => {
    const userId = req.user.id;

    try {
        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
            userId
        ]);

        if (result.affectedRows === 0) {
            return response(res, 404, false, "User tidak ditemukan");
        }

        return response(res, 200, true, "Akun berhasil dihapus");
    } catch (error) {
        return response(res, 500, false, "Gagal menghapus akun", null, {
            message: error.message
        });
    }
};

module.exports = {
    testConnection,
    changePassword,
    getAllUser,
    userProfile,
    deleteUserByAdmin,
    deleteOwnAccount
};
