const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authmiddleware = require('../middlewares/authmiddleware');

// require('dotenv').config();

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const { name, email, password } = req.body;
  
      // cek kalau semua field wajib diisi
      if (!name || !email || !password ) {
        return res.status(400).json({
          status: 102,
          message: 'Parameter name, email, password harus diisi'
        });
      }
  
      // validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 102,
          message: 'Format email tidak valid'
        });
      }
  
      // validasi panjang password
      if (password.length < 8) {
        return res.status(400).json({
          status: 104,
          message: 'Password minimal 8 karakter'
        });
      }
  
      // cek apakah email sudah terdaftar
      const [rows] = await conn.execute('SELECT id_regis FROM users WHERE email = ?', [email]);
      if (rows.length) {
        return res.status(409).json({
          status: 105,
          message: 'Email sudah terdaftar'
        });
      }
  
      const hashed = await bcrypt.hash(password, 10);
      const createdAt = new Date();
  
      const [result] = await conn.execute(
        'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)',
        [name, email, hashed, createdAt]
      );
  
      const id_regis = result.insertId;
  
      await conn.execute(
        'INSERT INTO wallets (id_regis, balance, updated_at) VALUES (?, ?, ?)',
        [id_regis, 0, createdAt]
      );
  
      const token = jwt.sign(
        { id_regis, email }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
  
      return res.status(201).json({
        status: 0,
        message: 'Registrasi berhasil silahkan login',
        data: {
          
        }
      });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: 500,
        message: 'Server error'
      });
    } finally {
      conn.release();
    }
  });
  

// Login
router.post('/login', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { email, password } = req.body;

    // cek field email
    if (!email) {
      return res.status(400).json({
        status: 102,
        message: "Parameter email wajib diisi",
        data: null
      });
    }
    
    if (!password) {
      return res.status(400).json({
        status: 103,
        message: "Username atau password salah",
        data: null
      });
    }
    

    // validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 102,
        message: "Parameter email tidak sesuai format",
        data: null
      });
    }

    // password minimal 8 karakter
    if (password.length < 8) {
      return res.status(400).json({
        status: 103,
        message: "Username atau password salah",
        data: null
      });
    }

    // cek user di db
    const [rows] = await conn.execute(
      'SELECT id_regis, name, email, password FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        status: 103,
        message: "Username atau password salah",
        data: null
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: 103,
        message: "Username atau password salah",
        data: null
      });
    }

    // Generate token 12 jam
    const token = jwt.sign(
      { id_regis: user.id_regis, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    
    return res.json({
      status: 0,
      message: "Login Sukses",
      data: {
        token: token
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null
    });
  } finally {
    conn.release();
  }
});





// Profile
router.get('/profile', authmiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const { email } = req.user; // dari token

    const [rows] = await conn.query(
      'SELECT id_regis, name, email, profile_image FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    conn.release();

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    
    const fullName = rows[0].name || '';
    const nameParts = fullName.split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    return res.json({
      status: 0,
      message: 'Sukses',
      data: {
        email: rows[0].email,
        first_name,
        last_name,
        profile_image: rows[0].profile_image || null
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
});





// Update Profile
router.put('/profile/update', authmiddleware, async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const { first_name, last_name } = req.body;
  
      // validasi input
      if (!first_name || !last_name) {
        return res.status(400).json({
          status: 102,
          message: 'first_name dan last_name wajib diisi'
        });
      }
  
      const { email } = req.user; // dari token
  
      const [result] = await conn.execute(
        `UPDATE users 
         SET name = CONCAT(?, ' ', ?) 
         WHERE email = ?`,
        [first_name, last_name, email]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: 404,
          message: 'User tidak ditemukan'
        });
      }
  
      return res.json({
        status: 0,
        message: 'Update profile berhasil',
        data: {
          first_name,
          last_name
        }
      });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: 500,
        message: 'Internal server error'
      });
    } finally {
      conn.release();
    }
  });



  // Multer storage gambar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/profile'); 
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const fileName = req.user.id_regis + '_profile' + ext;
      cb(null, fileName);
    }
  });
  
  // Filter file type
  const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only jpeg and png files allowed'), false);
    }
    cb(null, true);
  };
  
  const upload = multer({ storage, fileFilter });



  router.put('/profile/image', authmiddleware, upload.single('file'), async (req, res) => {
    const conn = await pool.getConnection();
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 102,
          message: 'Format Image tidak sesuai'
        });
      }
  
      const { email } = req.user;
      const imagePath = '/uploads/profile/' + req.file.filename;
  
      await conn.execute(
        `UPDATE users SET profile_image = ? WHERE email = ?`,
        [imagePath, email]
      );
  
      return res.json({
        status: 0,
        message: 'Upload profile image berhasil',
        data: {
          image: imagePath
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: 500,
        message: 'Internal server error'
      });
    } finally {
      conn.release();
    }
  });
  
  
  
  

module.exports = router;
