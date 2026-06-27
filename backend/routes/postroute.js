const router = require('express').Router();
const Post = require('../models/postmodel');
const User = require('../models/usermodel');
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// CREATE POST
router.post('/', async (req, res) => {
  try {
    // Content Moderation check
    if (req.body.content) {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a strict content moderator. Reply with exactly "TRUE" if the following text contains abusive, offensive, or inappropriate words. Reply with exactly "FALSE" if it is clean. Do not add any other text.'
          },
          {
            role: 'user',
            content: req.body.content
          }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0,
      });

      const responseText = chatCompletion.choices[0]?.message?.content?.trim().toUpperCase();
      if (responseText === 'TRUE') {
        return res.status(400).json({ error: "Post contains inappropriate content and cannot be published." });
      }
    }

    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    console.error(err);
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
    if (!post) {
      return res.status(404).json("Post not found");
    }
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
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }
    if (post.userId.toString() === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post has been deleted");
    } else {
      res.status(403).json("You can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
