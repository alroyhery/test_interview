// routes/transaction.js
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middlewares/authmiddleware');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

/*
 Expected body for purchase:
 {
   "service": "pulsa" | "voucher_game" | "other",
   "provider_code": "something", // optional, depends on implementation
   "amount": 50000,
   "customer_number": "0812xxxx",
   "price": 50000 // actual price to charge the wallet
 }
*/

// Create transaction (protected)
router.post('/purchase', authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const id_regis = req.user.id_regis;
    const { service, amount, price, customer_number, provider_code } = req.body;

    // basic validation
    if (!service || !price) return res.status(400).json({ error: 'service and price are required' });
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return res.status(400).json({ error: 'price must be a positive number' });

    // Start transaction
    await conn.beginTransaction();

    // Lock wallet row
    const [walletRows] = await conn.execute('SELECT balance FROM wallets WHERE id_regis = ? FOR UPDATE', [id_regis]);
    if (!walletRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const currentBalance = Number(walletRows[0].balance);
    if (currentBalance < parsedPrice) {
      await conn.rollback();
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const newBalance = currentBalance - parsedPrice;
    await conn.execute('UPDATE wallets SET balance = ?, updated_at = ? WHERE id_regis = ?', [newBalance, new Date(), id_regis]);

    // create transaction record
    const trx_id = uuidv4();
    const created_at = new Date();
    await conn.execute(
      'INSERT INTO transactions (trx_id, id_regis, service, provider_code, customer_number, amount, price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [trx_id, id_regis, service, provider_code || null, customer_number || null, amount || null, parsedPrice, 'success', created_at]
    );

    // Commit
    await conn.commit();

    // For demo: we assume the external provider call succeeded.
    // In real case, you'd call the provider and update transaction status accordingly.

    res.json({ message: 'Transaction successful', trx_id, balance: newBalance });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Optional: get transaction detail
router.get('/:trx_id', authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const id_regis = req.user.id_regis;
    const trx_id = req.params.trx_id;

    const [rows] = await conn.execute('SELECT * FROM transactions WHERE trx_id = ? AND id_regis = ?', [trx_id, id_regis]);
    if (!rows.length) return res.status(404).json({ error: 'Transaction not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
