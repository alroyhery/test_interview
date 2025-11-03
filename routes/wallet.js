// routes/wallet.js
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middlewares/authmiddleware');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Cek saldo (protected)
router.get('/balance', authMiddleware, async (req, res) => {
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
router.post('/topup', authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const id_regis = req.user.id_regis;
    let { amount, reference } = req.body;
    amount = Number(amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: 'amount must be a positive number' });

    // transaction start
    await conn.beginTransaction();

    // Update wallet balance with prepared statement
    const [walletRows] = await conn.execute('SELECT balance FROM wallets WHERE id_regis = ? FOR UPDATE', [id_regis]);
    if (!walletRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const newBalance = Number(walletRows[0].balance) + amount;
    await conn.execute('UPDATE wallets SET balance = ?, updated_at = ? WHERE id_regis = ?', [newBalance, new Date(), id_regis]);

    // insert topup record
    const topupId = uuidv4();
    await conn.execute(
      'INSERT INTO topups (topup_id, id_regis, amount, reference, created_at) VALUES (?, ?, ?, ?, ?)',
      [topupId, id_regis, amount, reference || null, new Date()]
    );

    await conn.commit();
    res.json({ message: 'Topup success', topup_id: topupId, balance: newBalance });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
