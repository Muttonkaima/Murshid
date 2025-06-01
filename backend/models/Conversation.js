const mongoose = require('mongoose');

// Message subdocument schema
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: [true, 'Role is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Main Conversation schema
const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  messages: [messageSchema],
  isDeleted: {
    type: Boolean,
    default: false,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for user reference and timestamps
conversationSchema.index({ user: 1, createdAt: -1 });
conversationSchema.index({ updatedAt: -1 });

// Query middleware to filter out deleted conversations
conversationSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Method to soft delete conversation
conversationSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  await this.save({ validateBeforeSave: false });
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
