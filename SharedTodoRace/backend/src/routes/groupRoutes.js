import express from 'express';
import Group from '../models/Group.js';
import User from '../models/User.js';

const router = express.Router();

// Create new group
router.post('/create', async (req, res) => {
  try {
    const { name, creatorId } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Group name must be at least 3 characters long' 
      });
    }

    // Check if group name already exists
    const existingGroup = await Group.findOne({ 
      name: name.trim() 
    });

    if (existingGroup) {
      return res.status(409).json({ 
        error: 'Group name already taken' 
      });
    }

    // Get creator info
    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const group = new Group({
      name: name.trim(),
      creatorId,
      members: [{
        userId: creatorId,
        username: creator.username,
        status: 'accepted'
      }]
    });

    await group.save();

    res.status(201).json({
      id: group._id,
      name: group.name,
      creatorId: group.creatorId,
      members: group.members,
      createdAt: group.createdAt
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Search groups by name
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    const groups = await Group.find({
      name: { $regex: query, $options: 'i' }
    }).select('_id name creatorId members createdAt');

    const formattedGroups = groups.map(group => ({
      id: group._id,
      name: group.name,
      creatorId: group.creatorId,
      members: group.members,
      createdAt: group.createdAt
    }));

    res.json(formattedGroups);

  } catch (error) {
    console.error('Search groups error:', error);
    res.status(500).json({ error: 'Failed to search groups' });
  }
});

// Get group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      id: group._id,
      name: group.name,
      creatorId: group.creatorId,
      members: group.members,
      createdAt: group.createdAt
    });

  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
});

// Get user's groups
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const groups = await Group.find({
      'members.userId': userId,
      'members.status': 'accepted'
    }).select('_id name creatorId members createdAt');

    const formattedGroups = groups.map(group => ({
      id: group._id,
      name: group.name,
      creatorId: group.creatorId,
      members: group.members,
      createdAt: group.createdAt
    }));

    res.json(formattedGroups);

  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ error: 'Failed to get user groups' });
  }
});

export default router;