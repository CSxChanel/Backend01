const { db } = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const response = require("../helpers/response");

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_KEY = process.env.REFRESH_KEY;
const EXPIRED_KEY = process.env.EXPIRED_KEY;

// POST auth/register UNTUK REGISTER
const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Validasi panjang password
        if (password.length < 6) {
            return response(
                res,
                400,
                false,
                "Password minimal 6 karakter",
                null,
                "Registrasi gagal."
            );
        }

        // Validasi password dan confirm password sama
        // if (password !== confirmPassword) {
        //     return response(
        //         res,
        //         400,
        //         false,
        //         "Password tidak sama dengan Confirm-password!",
        //         null,
        //         "Registrasi gagal."
        //     );
        // }

        const connection = await db();

        // Cek username atau email sudah terdaftar
        const [adaGak] = await connection.execute(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [username, email]
        );
        if (adaGak.length > 0) {
            return response(
                res,
                400,
                false,
                "Username atau Email sudah terdaftar!",
                null,
                "Registrasi gagal."
            );
        }

        // Lanjut proses register...
        const passwordAcak = await bcrypt.hash(password, 10);
        const [hasil] = await connection.execute(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, email, passwordAcak, "user"]
        );

        const user = {
            id: hasil.insertId,
            username,
            email,
            role: "user"
        };

        response(res, 201, true, "Registrasi berhasil.", user);
    } catch (err) {
        response(res, 500, false, "Gagal register!", null, {
            message: err.message
        });
    }
};

// POST auth/login UNTUK LOGIN
const login = async (req, res) => {
    const { identifikasi, password } = req.body;

    if (!identifikasi || !password) {
        return response(
            res,
            400,
            false,
            "Mohon isi username/email dan password!",
            null,
            "Login gagal!"
        );
    }

    try {
        const connection = await db();

        const [hasilQuery] = await connection.execute(
            "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
            [identifikasi, identifikasi]
        );

        if (hasilQuery.length === 0) {
            return response(
                res,
                404,
                false,
                "Username atau Email tidak ditemukan!",
                null,
                "Login gagal!"
            );
        }

        const user = hasilQuery[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response(
                res,
                400,
                false,
                "Password salah",
                null,
                "Login gagal!"
            );
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            SECRET_KEY,
            { expiresIn: EXPIRED_KEY }
        );

        // Buat refresh token
        const refreshToken = jwt.sign({ id: user.id }, REFRESH_KEY, {
            expiresIn: "7d"
        });

        // Simpan refresh token ke DB
        await connection.execute(
            "UPDATE users SET refresh_token = ? WHERE id = ?",
            [refreshToken, user.id]
        );

        // Kirim refreshToken via cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // true kalau pakai HTTPS
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
        });

        delete user.password;

        response(res, 200, true, "Login berhasil.", { user, token });
    } catch (err) {
        response(res, 500, false, "Terjadi kesalahan saat login.", null, {
            message: err.message
        });
    }
};

// POST api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const connection = await db();
        const [users] = await connection.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return response(res, 404, false, "Email tidak terdaftar!");
        }

        const user = users[0];

        // Buat token reset
        const resetToken = jwt.sign({ id: user.id }, SECRET_KEY, {
            expiresIn: "15m"
        });

        // Simpan token ke DB (opsional, tergantung skema kamu)
        await connection.execute(
            "UPDATE users SET token = ?, token_exp = ? WHERE id = ?",
            [
                resetToken,
                new Date(Date.now() + 15 * 60 * 1000), // expire 15 menit
                user.id
            ]
        );

        // Kirim token lewat email atau response
        // Misalnya: kirim via email, tapi untuk testing kita tampilkan saja:
        response(res, 200, true, "Token reset berhasil di kirim.", { resetToken });
    } catch (err) {
        response(res, 500, false, "Gagal membuat token reset!", null, {
            message: err.message
        });
    }
};

// POST api/auth/reset-password
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const connection = await db();

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await connection.execute(
            "UPDATE users SET password = ?, token = NULL, token_exp = NULL WHERE id = ?",
            [hashedPassword, decoded.id]
        );

        response(res, 200, true, "Password berhasil direset.");
    } catch (err) {
        response(
            res,
            400,
            false,
            "Token tidak valid atau sudah expired!",
            null,
            { message: err.message }
        );
    }
};

// UNTUK REFRESH TOKEN
const refresh = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token)
        return response(
            res,
            403,
            false,
            "Token tidak tersedia",
            token,
            "Akses ditolak!"
        );

    try {
        const decoded = jwt.verify(token, REFRESH_KEY);
        const connection = await db();
        const [rows] = await connection.execute(
            "SELECT * FROM users WHERE id = ? AND refresh_token = ?",
            [decoded.id, token]
        );
        await connection.end();

        if (rows.length === 0)
            return response(
                res,
                403,
                false,
                "Token tidak cocok",
                null,
                "gagal!"
            );

        const payload = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
            role: decoded.role
        };
        const newToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "15m" });
        response(
            res,
            200,
            true,
            { accessToken: newToken },
            "Token baru dibuat",
            null
        );
    } catch (err) {
        response(res, 403, false, "Token invalid", null, err.message);
    }
};

// POST auth/logout UNTUK LOGOUT
const logout = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return response(res, 200, true, "Logout berhasil", null, null);

    const decoded = jwt.verify(token, REFRESH_KEY);
    const connection = await db();
    await connection.execute(
        "UPDATE users SET refresh_token = NULL WHERE id = ? AND refresh_token = ?",
        [decoded.id, token]
    );
    await connection.end();

    res.clearCookie("refreshToken");
    response(res, 200, false, "Logout berhasil.", null, null);
};

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    refresh,
    logout
};
