const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // For image uploads

// Database Connection
mongoose.connect(process.env.ATLAS_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
const userRoute = require('./routes/userroute');
const postRoute = require('./routes/postroute');
const notificationRoute = require('./routes/notificationroute');

app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/notifications', notificationRoute);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));