// app.js
const express = require('express');
require('dotenv').config();
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
