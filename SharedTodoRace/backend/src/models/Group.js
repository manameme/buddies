import mongoose from 'mongoose';

const groupMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'accepted'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [groupMemberSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

groupSchema.index({ name: 'text' });
groupSchema.index({ creatorId: 1 });
groupSchema.index({ 'members.userId': 1 });

export default mongoose.model('Group', groupSchema);