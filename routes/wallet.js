// routes/wallet.js
const express = require('express');
const pool = require('../db');
const authmiddleware = require('../middlewares/authmiddleware');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Cek saldo (protected)
router.get('/balance', authmiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const id_regis = req.user.id_regis;
    const [rows] = await conn.execute('SELECT balance FROM wallets WHERE id_regis = ?', [id_regis]);
    if (!rows.length) return res.status(404).json({ error: 'Wallet not found' });
    res.json({ id_regis, balance: rows[0].balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Topup (protected)
// Body: { amount: number, reference: optional }
router.post('/topup', authmiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const id_regis = req.user.id_regis;
    let { top_up_amount, reference } = req.body;

    top_up_amount = Number(top_up_amount);

    if (!top_up_amount || top_up_amount <= 0) {
      return res.status(400).json({
        status: 102,
        message: "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
        data: null
      });
    }

    await conn.beginTransaction();

    const [walletRows] = await conn.execute(
      'SELECT balance FROM wallets WHERE id_regis = ? FOR UPDATE',
      [id_regis]
    );

    if (!walletRows.length) {
      await conn.rollback();
      return res.status(404).json({
        status: 404,
        message: "Wallet not found",
        data: null
      });
    }

    const newBalance = Number(walletRows[0].balance) + top_up_amount;

    await conn.execute(
      'UPDATE wallets SET balance = ?, updated_at = ? WHERE id_regis = ?',
      [newBalance, new Date(), id_regis]
    );

    // Insert Topup Log
    const topupId = uuidv4();
    await conn.execute(
      'INSERT INTO topups (topup_id, id_regis, amount, reference, created_at) VALUES (?, ?, ?, ?, ?)',
      [topupId, id_regis, top_up_amount, reference || null, new Date()]
    );

    await conn.commit();

    return res.json({
      status: 0,
      message: "Top Up Balance berhasil",
      data: { balance: newBalance }
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);

    return res.status(500).json({
      status: 500,
      message: "Server error",
      data: null
    });
  } finally {
    conn.release();
  }
});


module.exports = router;
