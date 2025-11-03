const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const authmiddleware = require('../middlewares/authmiddleware');

router.get('/services', authmiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT service_code, service_name, service_icon, service_tariff
      FROM services
    `);

    return res.json({
      status: 0,
      message: "Sukses",
      data: rows
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error"
    });
  } finally {
    conn.release();
  }
});

module.exports = router;
