import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Process the form data
    const formData = await request.formData();
    const username = formData.get('username');
    const bio = formData.get('bio');
    const profileImage = formData.get('profileImage');
    
    // Validate username
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if username is taken (if it's different from current user's)
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: session.user.id } 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }
    
    // Prepare update data
    const updateData = {
      username,
      bio: bio || '',
    };
    
    // Handle profile image upload if provided
    if (profileImage) {
      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create a unique filename
      const fileName = `${session.user.id}-${Date.now()}${path.extname(profileImage.name)}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      
      // Save file to public/uploads directory
      await writeFile(filePath, buffer);
      
      // Update profile picture URL
      updateData.profilePicture = `/uploads/${fileName}`;
    }
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    ).select('-password');
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}