const router = require('express').Router();
const Notification = require('../models/notificationmodel');

// GET user notifications
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.userId })
      .populate('sender', 'username profilePicture')
      .populate('post', 'content image')
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Mark all as read (MUST be above /:id/read to avoid route conflict)
router.put('/read-all/:userId', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.params.userId },
      { $set: { read: true } }
    );
    res.status(200).json("All notifications marked as read");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, 
      { $set: { read: true } }, 
      { new: true }
    );
    if (!notification) {
      return res.status(404).json("Notification not found");
    }
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
