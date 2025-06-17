import express from 'express';
import Task from '../models/Task.js';

const router = express.Router();

// Create new task
router.post('/create', async (req, res) => {
  try {
    const { title, description, userId, groupId } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Task title is required' 
      });
    }

    const task = new Task({
      title: title.trim(),
      description: description?.trim() || '',
      userId,
      groupId
    });

    await task.save();

    res.status(201).json({
      id: task._id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      groupId: task.groupId,
      createdAt: task.createdAt,
      completedAt: task.completedAt
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get user tasks for a specific group
router.get('/user/:userId/group/:groupId', async (req, res) => {
  try {
    const { userId, groupId } = req.params;

    const tasks = await Task.find({ userId, groupId })
      .sort({ createdAt: -1 });

    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      groupId: task.groupId,
      createdAt: task.createdAt,
      completedAt: task.completedAt
    }));

    res.json(formattedTasks);

  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ error: 'Failed to get user tasks' });
  }
});

// Get all tasks for a group
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const tasks = await Task.find({ groupId })
      .sort({ createdAt: -1 });

    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      groupId: task.groupId,
      createdAt: task.createdAt,
      completedAt: task.completedAt
    }));

    res.json(formattedTasks);

  } catch (error) {
    console.error('Get group tasks error:', error);
    res.status(500).json({ error: 'Failed to get group tasks' });
  }
});

// Toggle task completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;

    await task.save();

    res.json({
      id: task._id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      groupId: task.groupId,
      createdAt: task.createdAt,
      completedAt: task.completedAt
    });

  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;