import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(request, { params }) {
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
    
    const userId = session.user.id;
    
    // Check if user already liked this review
    const alreadyLiked = review.likedBy.includes(userId);
    
    if (alreadyLiked) {
      // Remove like
      review.likedBy = review.likedBy.filter(id => id.toString() !== userId);
      review.likes = review.likedBy.length;
      
      await review.save();
      
      return NextResponse.json({
        message: 'Like removed successfully',
        likes: review.likes,
        liked: false,
      });
    } else {
      // Add like
      review.likedBy.push(userId);
      review.likes = review.likedBy.length;
      
      await review.save();
      
      return NextResponse.json({
        message: 'Review liked successfully',
        likes: review.likes,
        liked: true,
      });
    }
  } catch (error) {
    console.error('Error liking review:', error);
    return NextResponse.json(
      { error: 'Failed to like review' },
      { status: 500 }
    );
  }
}