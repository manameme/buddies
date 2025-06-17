import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  groupName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate requests
joinRequestSchema.index({ groupId: 1, userId: 1 }, { unique: true });
joinRequestSchema.index({ userId: 1, status: 1 });
joinRequestSchema.index({ groupId: 1, status: 1 });

// Change this line from CommonJS to ES Modules:
export default mongoose.model('JoinRequest', joinRequestSchema);
// Instead of:
// module.exports = mongoose.model('JoinRequest', joinRequestSchema);