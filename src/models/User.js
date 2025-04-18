import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't return password in queries
  },
  profilePicture: {
    type: String,
    default: '/default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  favoriteGames: [{
    type: String, // IGDB game IDs
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Check if model exists before creating it (for Next.js hot reloading)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;