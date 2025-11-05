const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/banner', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT banner_name, banner_image, description FROM banners');
    conn.release();

    res.json({
      status: 0,
      message: "Sukses",
      data: rows
    });

  } catch (err) {
    res.status(500).json({
      status: 102,
      message: err.message
    });
  }
});

module.exports = router;
