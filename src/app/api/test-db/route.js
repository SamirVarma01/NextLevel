import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    // Test database connection
    const connection = await connectToDatabase();
    
    return NextResponse.json({ 
      message: 'Database connection successful',
      isConnected: !!connection.connections[0].readyState
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Database connection failed', details: error.message },
      { status: 500 }
    );
  }
}