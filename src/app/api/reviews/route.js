import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to create a review' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { gameId, gameName, gameImage, title, content, rating } = await request.json();
    
    // Validate input
    if (!gameId || !gameName || !title || !content || !rating) {
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
    
    // Check if user already reviewed this game
    const existingReview = await Review.findOne({
      user: session.user.id,
      gameId,
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this game' },
        { status: 409 }
      );
    }
    
    // Create new review
    const review = await Review.create({
      user: session.user.id,
      gameId,
      gameName,
      gameImage,
      title,
      content,
      rating,
    });
    
    // Return the created review
    return NextResponse.json({
      message: 'Review created successfully',
      review,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Connect to database
    await connectToDatabase();
    
    // Build query
    const query = {};
    if (gameId) {
      query.gameId = gameId;
    }
    
    // Get total count for pagination
    const totalReviews = await Review.countDocuments(query);
    
    // Get reviews with pagination
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePicture')
      .lean();
    
    return NextResponse.json({
      reviews,
      pagination: {
        total: totalReviews,
        page,
        limit,
        pages: Math.ceil(totalReviews / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}