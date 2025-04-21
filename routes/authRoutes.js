const express = require("express");
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    refresh,
    logout
} = require("../controllers/authController");

const db = require("./config/db");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh", refresh);
router.post("/logout", logout);


// Express API menerima data dari Mikrotik
router.post("/mikrotik-activity", async (req, res) => {
  const { username, ip, uptime } = req.body;
  const timestamp = new Date();

  // validasi username, pastikan dia ada di database users
  const [user] = await db.query("SELECT id FROM users WHERE pppoe_username = ?", [username]);
  if (user.length === 0) {
    return res.status(400).json({ message: "User tidak ditemukan" });
  }

  await db.query(
    "INSERT INTO user_activity (user_id, username, ip, uptime, timestamp) VALUES (?, ?, ?, ?, ?)",
    [user[0].id, username, ip, uptime, timestamp]
  );

  res.status(200).json({ message: "Data activity disimpan" });
});


module.exports = router;
