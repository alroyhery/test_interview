// app.js
const express = require('express');
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transaction');
const bannerRoutes = require('./routes/banner');
const serviceRoutes = require('./routes/service');

const app = express();
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api', transactionRoutes);
app.use('/api', bannerRoutes);
app.use('/api', serviceRoutes);

// health
app.get('/', (req, res) => res.json({ status: 'ok' }));


const pool = require('./db');
pool.getConnection()
  .then(() => console.log("DB connected"))
  .catch(err => console.error("DB connection error:", err));


console.log("ENV PORT VALUE:", process.env.PORT);


const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", function () {
  console.log(`Server232 running on port ${PORT}`);
});

