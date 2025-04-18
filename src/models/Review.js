import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  gameId: {
    type: String, // IGDB game ID
    required: [true, 'Review must be for a game']
  },
  gameName: {
    type: String,
    required: [true, 'Game name is required']
  },
  gameImage: {
    type: String,
    default: '/default-game.png'
  },
  title: {
    type: String,
    required: [true, 'Review must have a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Review must have content'],
    minlength: [50, 'Review must be at least 50 characters long']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10']
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
ReviewSchema.index({ gameId: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

export default Review;