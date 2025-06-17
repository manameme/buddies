import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Create new user
router.post('/create', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters long' 
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Username already taken' 
      });
    }

    const user = new User({
      username: username.trim()
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      username: user.username,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.get('/username/:username', async (req, res) => {
    try {
      const { username } = req.params;
      
      // Add debug logging
      console.log('Searching for username:', username.toLowerCase());
      
      const user = await User.findOne({ 
        username: username.toLowerCase().trim() 
      });
  
      if (!user) {
        console.log('No user found for:', username);
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({
        id: user._id,
        username: user.username,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;