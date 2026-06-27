const router = require('express').Router();
const User = require('../models/usermodel');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.password !== user.password) {
      return res.status(400).json({ message: "Wrong password" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// SEARCH USERS
router.get('/search/:username', async (req, res) => {
  try {
    // Escape regex special characters to prevent invalid regex errors
    const escaped = req.params.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const users = await User.find({ 
      username: { $regex: escaped, $options: 'i' } 
    })
      .select('username profilePicture followers following')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE USER
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      // Remove userId from the update payload to avoid saving it as a field
      const { userId, ...updateData } = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: updateData,
      }, { new: true });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

// FOLLOW / UNFOLLOW USER
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const userToFollow = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!userToFollow || !currentUser) {
        return res.status(404).json("User not found");
      }

      if (!userToFollow.followers.includes(req.body.userId)) {
        await userToFollow.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        
        // Create notification
        const Notification = require('../models/notificationmodel');
        await new Notification({
          recipient: req.params.id,
          sender: req.body.userId,
          type: 'follow'
        }).save();

        res.status(200).json("User has been followed");
      } else {
        await userToFollow.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        res.status(200).json("User has been unfollowed");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself");
  }
});

module.exports = router;
