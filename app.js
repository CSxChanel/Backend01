// app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware global
app.use(cors({ origin: true, credentials: true })); // untuk tes API dari luar semua domain

// ini ketika sudah deploy dan hanya mengijinkan domain tertentu
// const allowedOrigins = [
//     "https://namadomainkamu.com",
//     "https://admin.namadomainkamu.com"
// ];
// app.use(
//     cors({
//         origin: function (origin, callback) {
//             if (!origin || allowedOrigins.includes(origin)) {
//                 callback(null, true);
//             } else {
//                 callback(new Error("Not allowed by CORS"));
//             }
//         },
//         credentials: true
//     })
// );

app.use(express.json());
app.use(cookieParser());

// Default Routing
app.get("/", (req, res) => {
    res.send("welcome API V.0.1");
});

// PATH /test, /get-data-users, /profile
app.use("/api/user", require("./routes/userRoutes"));

// PATH /login, /register, /logout, /forgot-password, /reset-password
app.use("/api/auth", require("./routes/authRoutes"));

// PATH /create, /callback
app.use("/api/payment", (req, res) => {
    res.send("path /payment untuk payment gateway");
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 404,
        success: false,
        message: "Endpoint tidak ditemukan"
    });
});

// JALANKAN
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
