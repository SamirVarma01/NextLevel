import { NextResponse } from 'next/server';
import { getPopularGames } from '@/lib/igdb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || 20;
  
  try {
    const games = await getPopularGames(parseInt(limit));
    return NextResponse.json(games);
  } catch (error) {
    console.error('Popular games fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular games', details: error.message },
      { status: 500 }
    );
  }
}