import { NextResponse } from 'next/server';
import { getGameById } from '@/lib/igdb';

export async function GET(request, { params }) {
  const id = params.id;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Game ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const game = await getGameById(id);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Game details fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game details', details: error.message },
      { status: 500 }
    );
  }
}