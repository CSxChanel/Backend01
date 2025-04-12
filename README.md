# cPhone Backend API

**cPhone Backend** adalah RESTful API yang dibangun menggunakan **Express.js** dan **MySQL** untuk menangani proses autentikasi, otorisasi, dan manajemen data pengguna serta produk. API ini digunakan oleh frontend `cPhone` untuk login, logout, dan pengambilan data profil pengguna.

---

## ✨ Fitur Utama

- Autentikasi menggunakan email/username dan password
- Login menghasilkan JWT token dan refresh token
- Middleware verifikasi token (protect route)
- Role-based access control (admin / user)
- Logout dan refresh token handler
- CRUD pengguna dan produk
- Terhubung dengan database MySQL
- CORS dan JSON response standar

---

## ⚙️ Teknologi yang Digunakan

- **Node.js + Express.js**
- **MySQL** (bisa pakai Railway / PlanetScale / lokal)
- **jsonwebtoken** untuk autentikasi
- **bcryptjs** untuk hash password
- **dotenv** untuk konfigurasi environment

---

## 📁 Struktur Folder

```
cphone-backend/
│
├── controllers/         # Logic untuk auth dan resource
│   ├── auth.controller.js
│   ├── user.controller.js
│   └── product.controller.js
│
├── routes/              # Routing endpoint
│   ├── auth.routes.js
│   ├── user.routes.js
│   └── product.routes.js
│
├── middleware/          # Auth middleware (verifyToken, role, etc)
│   └── auth.middleware.js
│
├── config/              # Koneksi database & konfigurasi
│   └── db.js
│
├── utils/               # Helper function (token, response)
│   └── generateToken.js
│
├── .env                 # Environment variable (API_PORT, DB_*, JWT_*)
├── app.js               # Inisialisasi express
└── server.js            # HTTP server
```

---

## 🔐 Autentikasi JWT

### Login:
- `POST /auth/login`
- Body: `{ identifikasi: "email or username", password: "password" }`
- Response: `{ token, refreshToken }`

### Protected Route:
- Gunakan header:
```http
Authorization: Bearer <token>
```

### Refresh Token:
- `POST /auth/refresh`
- Kirim refresh token untuk mendapatkan token baru

### Logout:
- `POST /auth/logout`
- Menghapus refresh token dari sisi client

---

## 🛠️ Menjalankan Server

### 1. Clone project
```bash
git clone https://github.com/username/cphone-backend.git
cd cphone-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Buat file `.env`
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cphone_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=1h
```

### 4. Jalankan server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

---

## ✅ Endpoint Utama

| METHOD | ENDPOINT           | DESKRIPSI                     |
|--------|--------------------|-------------------------------|
| POST   | /auth/login        | Login user dan dapatkan token |
| POST   | /auth/logout       | Logout dan hapus token        |
| POST   | /auth/refresh      | Refresh token JWT             |
| GET    | /user/profile      | Ambil data user (dengan token)|
| GET    | /products          | List produk                   |
| POST   | /products          | Tambah produk (admin only)    |


---

## ❤️ Kontribusi

Project ini dibuat oleh **[cp-sudrajat]**  
Untuk kebutuhan backend autentikasi dan manajemen resource dari frontend `cPhone`.

---

## 📜 Lisensi

Bebas digunakan untuk keperluan belajar dan pengembangan pribadi.

