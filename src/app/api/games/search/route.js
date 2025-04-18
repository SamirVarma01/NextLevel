import { NextResponse } from 'next/server';
import { searchGames } from '@/lib/igdb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || 10;
  
  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }
  
  try {
    const games = await searchGames(query, parseInt(limit));
    return NextResponse.json(games);
  } catch (error) {
    console.error('Game search error:', error);
    return NextResponse.json(
      { error: 'Failed to search games', details: error.message },
      { status: 500 }
    );
  }
}