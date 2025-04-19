import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import Comment from '@/models/Comment';
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
    
    // Parse request body
    const { content } = await request.json();
    
    // Validate input
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if review exists
    const review = await Review.findById(id);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Create new comment
    const comment = await Comment.create({
      review: id,
      user: session.user.id,
      content: content.trim(),
    });
    
    // Populate user data for response
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username profilePicture')
      .lean();
    
    return NextResponse.json({
      message: 'Comment added successfully',
      comment: populatedComment,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}