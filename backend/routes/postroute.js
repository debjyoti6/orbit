const router = require('express').Router();
const Post = require('../models/postmodel');
const User = require('../models/usermodel');

// CREATE POST
router.post('/', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL POSTS (FEED)
router.get('/', async (req, res) => {
  try {
    // Populate userId to get username and profilePicture in the frontend
    const posts = await Post.find().populate('userId', 'username profilePicture');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER'S POSTS (PROFILE)
router.get('/profile/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).populate('userId', 'username profilePicture');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LIKE / UNLIKE POST
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      
      // Create notification
      if (post.userId.toString() !== req.body.userId) {
        const Notification = require('../models/notificationmodel');
        await new Notification({
          recipient: post.userId,
          sender: req.body.userId,
          type: 'like',
          post: post._id
        }).save();
      }

      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE POST
router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json("Post has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
