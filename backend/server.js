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
const agentRoute = require('./routes/agentroute');

app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/agent', agentRoute);

// Scheduler for Agent Posts
const ScheduledPost = require('./models/scheduledpostmodel');
const Post = require('./models/postmodel');

setInterval(async () => {
  try {
    const now = new Date();
    const pendingPosts = await ScheduledPost.find({ 
      isPublished: false, 
      scheduledFor: { $lte: now } 
    });

    for (const sp of pendingPosts) {
      const newPost = new Post({
        userId: sp.userId,
        content: sp.content
      });
      await newPost.save();
      
      sp.isPublished = true;
      await sp.save();
      console.log(`Published scheduled post for user ${sp.userId}`);
    }
  } catch (err) {
    console.error("Error processing scheduled posts:", err);
  }
}, 60000); // Check every minute

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));