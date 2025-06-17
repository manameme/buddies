import express from 'express';  // Import the default export
import JoinRequest from '../models/JoinRequest.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

const router = express.Router();  // Access Router from express


router.post('/create', async (req, res) => {
    try {
      const { groupId, userId } = req.body;
  
      // Check if user and group exist
      const [user, group] = await Promise.all([
        User.findById(userId),
        Group.findById(groupId)
      ]);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }
  
      // Check if user is already a member
      const isAlreadyMember = group.members.some(
        member => member.userId.toString() === userId && member.status === 'accepted'
      );
  
      if (isAlreadyMember) {
        return res.status(409).json({ error: 'User is already a member of this group' });
      }
  
      // Check if there's already a pending request
      const existingRequest = await JoinRequest.findOne({
        groupId,
        userId,
        status: 'pending'
      });
  
      if (existingRequest) {
        return res.status(409).json({ error: 'Join request already exists' });
      }
  
      const joinRequest = new JoinRequest({
        groupId,
        userId,
        username: user.username,
        groupName: group.name
      });
  
      await joinRequest.save();

      if (req.io) {
        // Emit to the group creator's room
        req.io.to(`user_${group.creatorId}`).emit('newJoinRequest', {
          id: joinRequest._id,
          groupId: joinRequest.groupId,
          userId: joinRequest.userId,
          username: joinRequest.username,
          groupName: joinRequest.groupName,
          status: joinRequest.status,
          createdAt: joinRequest.createdAt
        });
        console.log(`Emitted to user_${group.creatorId}`);
      }
  
      // Get the populated group with creator
      const populatedGroup = await Group.findById(groupId).populate('creatorId');
      if (populatedGroup && req.io) { // req.io should be attached from your server
        req.io.to(`user_${populatedGroup.creatorId}`).emit('newJoinRequest', {
          requestId: joinRequest._id,
          groupId,
          userId,
          username: user.username,
          groupName: group.name
        });
        console.log(`Emitted newJoinRequest to user_${populatedGroup.creatorId}`); // Debug log
      }
  
      res.status(201).json({
        id: joinRequest._id,
        groupId: joinRequest.groupId,
        userId: joinRequest.userId,
        username: joinRequest.username,
        groupName: joinRequest.groupName,
        status: joinRequest.status,
        createdAt: joinRequest.createdAt
      });
  
    } catch (error) {
      console.error('Create join request error:', error);
      res.status(500).json({ error: 'Failed to create join request' });
    }
  });

// Get pending requests for a user
router.get('/user/:userId/pending', async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await JoinRequest.find({
      userId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    const formattedRequests = requests.map(request => ({
      id: request._id,
      groupId: request.groupId,
      userId: request.userId,
      username: request.username,
      groupName: request.groupName,
      status: request.status,
      createdAt: request.createdAt
    }));

    res.json(formattedRequests);

  } catch (error) {
    console.error('Get user pending requests error:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

// Get pending requests for a group (for group creator)
router.get('/group/:groupId/pending', async (req, res) => {
  try {
    const { groupId } = req.params;

    const requests = await JoinRequest.find({
      groupId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    const formattedRequests = requests.map(request => ({
      id: request._id,
      groupId: request.groupId,
      userId: request.userId,
      username: request.username,
      groupName: request.groupName,
      status: request.status,
      createdAt: request.createdAt
    }));

    res.json(formattedRequests);

  } catch (error) {
    console.error('Get group pending requests error:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

// Accept join request
router.patch('/:id/accept', async (req, res) => {
  try {
    const requestId = req.params.id;

    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    // Update request status
    joinRequest.status = 'accepted';
    await joinRequest.save();

    // Add user to group
    const group = await Group.findById(joinRequest.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is not already in the group
    const isAlreadyMember = group.members.some(
      member => member.userId.toString() === joinRequest.userId.toString()
    );

    if (!isAlreadyMember) {
      group.members.push({
        userId: joinRequest.userId,
        username: joinRequest.username,
        status: 'accepted'
      });
      await group.save();
    }

    res.json({
      id: joinRequest._id,
      groupId: joinRequest.groupId,
      userId: joinRequest.userId,
      username: joinRequest.username,
      groupName: joinRequest.groupName,
      status: joinRequest.status,
      createdAt: joinRequest.createdAt
    });

  } catch (error) {
    console.error('Accept join request error:', error);
    res.status(500).json({ error: 'Failed to accept join request' });
  }
});

// Reject join request
router.patch('/:id/reject', async (req, res) => {
  try {
    const requestId = req.params.id;

    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    joinRequest.status = 'rejected';
    await joinRequest.save();

    res.json({
      id: joinRequest._id,
      groupId: joinRequest.groupId,
      userId: joinRequest.userId,
      username: joinRequest.username,
      groupName: joinRequest.groupName,
      status: joinRequest.status,
      createdAt: joinRequest.createdAt
    });

  } catch (error) {
    console.error('Reject join request error:', error);
    res.status(500).json({ error: 'Failed to reject join request' });
  }
});

// Withdraw join request (user can withdraw their own pending request)
router.delete('/:id/withdraw', async (req, res) => {
  try {
    const requestId = req.params.id;
    const { userId } = req.body; // User ID should come from authenticated session in production

    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    // Verify the request belongs to the user
    if (joinRequest.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to withdraw this request' });
    }

    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be withdrawn' });
    }

    await JoinRequest.findByIdAndDelete(requestId);

    res.json({ message: 'Join request withdrawn successfully' });

  } catch (error) {
    console.error('Withdraw join request error:', error);
    res.status(500).json({ error: 'Failed to withdraw join request' });
  }
});

// Get all requests for a user (pending, accepted, rejected)
router.get('/user/:userId/all', async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await JoinRequest.find({
      userId
    }).sort({ createdAt: -1 });

    const formattedRequests = requests.map(request => ({
      id: request._id,
      groupId: request.groupId,
      userId: request.userId,
      username: request.username,
      groupName: request.groupName,
      status: request.status,
      createdAt: request.createdAt
    }));

    res.json(formattedRequests);

  } catch (error) {
    console.error('Get all user requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get all requests for a group (for group creator)
router.get('/group/:groupId/all', async (req, res) => {
  try {
    const { groupId } = req.params;

    const requests = await JoinRequest.find({
      groupId
    }).sort({ createdAt: -1 });

    const formattedRequests = requests.map(request => ({
      id: request._id,
      groupId: request.groupId,
      userId: request.userId,
      username: request.username,
      groupName: request.groupName,
      status: request.status,
      createdAt: request.createdAt
    }));

    res.json(formattedRequests);

  } catch (error) {
    console.error('Get all group requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get single request by ID
router.get('/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    res.json({
      id: joinRequest._id,
      groupId: joinRequest.groupId,
      userId: joinRequest.userId,
      username: joinRequest.username,
      groupName: joinRequest.groupName,
      status: joinRequest.status,
      createdAt: joinRequest.createdAt
    });

  } catch (error) {
    console.error('Get join request error:', error);
    res.status(500).json({ error: 'Failed to get join request' });
  }
});

export default router;  // ES Modules export