import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: [true, 'Comment must belong to a review']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment must belong to a user']
  },
  content: {
    type: String,
    required: [true, 'Comment must have content'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add indexes for better query performance
CommentSchema.index({ review: 1 });
CommentSchema.index({ user: 1 });
CommentSchema.index({ createdAt: -1 });

const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

export default Comment;