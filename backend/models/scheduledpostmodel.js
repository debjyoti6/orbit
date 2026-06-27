const mongoose = require('mongoose');

const ScheduledPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  scheduledFor: { type: Date, required: true },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledPost', ScheduledPostSchema);
