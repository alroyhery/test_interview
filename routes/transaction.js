// routes/transaction.js
const express = require('express');
const pool = require('../db');
const authmiddleware = require('../middlewares/authmiddleware');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();


// Transaction
router.post('/transaction', authmiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  console.log("REQ BODY:", req.body);

  try {
    const id_regis = req.user.id_regis;
    const { service_code } = req.body;

    if (!service_code) {
      return res.status(400).json({
        status: 102,
        message: 'Service atau Layanan tidak ditemukan',
        data: null
      });
    }

    await conn.beginTransaction();

    // ambil data service
    const [serviceRows] = await conn.execute(
      'SELECT service_code, service_name, service_tariff FROM services WHERE service_code = ?',
      [service_code]
    );

    if (!serviceRows.length) {
      await conn.rollback();
      return res.status(400).json({
        status: 102,
        message: 'Service atau Layanan tidak ditemukan',
        data: null
      });
    }

    const service = serviceRows[0];
    const amount = Number(service.service_tariff);

    // cek wallet
    const [walletRows] = await conn.execute(
      'SELECT balance FROM wallets WHERE id_regis = ? FOR UPDATE',
      [id_regis]
    );

    if (!walletRows.length) {
      await conn.rollback();
      return res.status(404).json({
        status: 104,
        message: 'Wallet tidak ditemukan',
        data: null
      });
    }

    const balance = Number(walletRows[0].balance);

    if (balance < amount) {
      await conn.rollback();
      return res.status(400).json({
        status: 105,
        message: 'Saldo tidak mencukupi',
        data: null
      });
    }

    const newBalance = balance - amount;
    await conn.execute(
      'UPDATE wallets SET balance = ?, updated_at = ? WHERE id_regis = ?',
      [newBalance, new Date(), id_regis]
    );

    const trx_id = uuidv4();
    const created_at = new Date();
    const invoice_number = `INV${created_at.toISOString().replace(/[-:.TZ]/g, '')}-${Math.floor(Math.random() * 1000)}`;

    await conn.execute(
      `INSERT INTO transactions 
       (trx_id, id_regis, service_code, transaction_type, amount, status, created_at, invoice_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [trx_id, id_regis, service_code, 'PAYMENT', amount, 'success', created_at, invoice_number]
    );

    await conn.commit();

    return res.json({
      status: 0,
      message: 'Transaksi berhasil',
      data: {
        invoice_number,
        service_code: service.service_code,
        service_name: service.service_name,
        transaction_type: 'PAYMENT',
        total_amount: amount,
        created_on: created_at
      }
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: 'Server error',
      data: null
    });
  } finally {
    conn.release();
  }
});


// Transaction history
router.get('/transaction/history', authmiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id_regis; 
    let { limit, offset } = req.query;

    limit = limit ? parseInt(limit) : null; 
    offset = offset ? parseInt(offset) : 0;

    let query = `
      SELECT 
        t.invoice_number,
        t.transaction_type,
        s.service_name AS description,
        t.amount AS total_amount,
        t.created_at AS created_on
      FROM transactions t
      LEFT JOIN services s ON t.service_code = s.service_code
      WHERE t.id_regis = ?
      ORDER BY t.created_at DESC
    `;

    const params = [userId];

    if (limit !== null) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const [rows] = await conn.query(query, params);

    return res.json({
      status: 0,
      message: "Get History Berhasil",
      data: {
        offset: offset || 0,
        limit: limit || rows.length,
        records: rows.map(r => ({
          invoice_number: r.invoice_number,
          transaction_type: r.transaction_type,
          description: r.description || "",
          total_amount: Number(r.total_amount),
          created_on: r.created_on
        }))
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 99,
      message: "Internal Server Error",
      data: null
    });
  } finally {
    conn.release();
  }
});


module.exports = router;
