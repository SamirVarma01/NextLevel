import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import Comment from '@/models/Comment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get a single review by ID
export async function GET(request, { params }) {
  const { id } = params;
  
  try {
    // Connect to database
    await connectToDatabase();
    
    // Find review by ID and populate user field
    const review = await Review.findById(id)
      .populate('user', 'username profilePicture')
      .lean();
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Get comments for this review
    const comments = await Comment.find({ review: id })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture')
      .lean();
    
    // Add comments to the review
    review.comments = comments;
    
    return NextResponse.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// Update a review
export async function PUT(request, { params }) {
  const { id } = params;
  
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { title, content, rating } = await request.json();
    
    // Validate input
    if (!title || !content || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (content.length < 50) {
      return NextResponse.json(
        { error: 'Review content must be at least 50 characters long' },
        { status: 400 }
      );
    }
    
    if (rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 10' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find review by ID
    const review = await Review.findById(id);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the author of the review
    if (review.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this review' },
        { status: 403 }
      );
    }
    
    // Update review
    review.title = title;
    review.content = content;
    review.rating = rating;
    
    await review.save();
    
    return NextResponse.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// Delete a review
export async function DELETE(request, { params }) {
  const { id } = params;
  
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find review by ID
    const review = await Review.findById(id);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the author of the review
    if (review.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this review' },
        { status: 403 }
      );
    }
    
    // Delete review
    await Review.findByIdAndDelete(id);
    
    // Delete all comments for this review
    await Comment.deleteMany({ review: id });
    
    return NextResponse.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}