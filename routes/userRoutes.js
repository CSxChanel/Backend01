// routes/userRoutes
const express = require("express");
const router = express.Router();
const {
    testConnection,
    changePassword,
    getAllUser,
    userProfile,
    deleteUserByAdmin,
    deleteOwnAccount
} = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

router.get("/test", testConnection);
router.post("/change-password", authenticate, changePassword);

// GET /api/user/get-data-users?page=2&limit=5&search=user5
router.get("/get-data-users", getAllUser);

// GET ambil data profile sesuai id
router.get("/profile", authenticate, userProfile);

// Hanya Admin yg Delete
router.delete(
    "/delete/:id",
    authenticate,
    authorize("admin"),
    deleteUserByAdmin
);

// Delete user akun sendiri
router.delete("/delete-account", authenticate, deleteOwnAccount);

module.exports = router;
