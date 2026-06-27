const router = require('express').Router();
const Post = require('../models/postmodel');
const User = require('../models/usermodel');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gen AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// CREATE POST
router.post('/', async (req, res) => {
  try {
    // 1. Check content with AI if text is provided
    if (req.body.content) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a strict content moderation AI for a professional social media platform.
Analyze the following user post. You MUST block it if it contains any of the following:
1. Profanity, curse words, or swearing (e.g. f-words, b-words).
2. Insults, bullying, harassment, or personal attacks.
3. Violence, hate speech, or illegal acts.
4. Obvious fake news/misinformation.

If the post violates ANY of these rules, reply ONLY with the exact word "REJECT". 
If it is a normal personal update, harmless opinion, or friendly content, reply ONLY with the exact word "APPROVE".

User post: "${req.body.content}"`;
      
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text().trim();
      
      if (aiResponse.includes("REJECT")) {
        return res.status(400).json({ error: "Post blocked: Violates community guidelines (Profanity, harassment, or inappropriate content)." });
      }
    }

    // 2. If AI approves (or there's no text content), save the post
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    console.error("Post Creation Error:", err);
    res.status(500).json({ error: "An error occurred while creating the post." });
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
