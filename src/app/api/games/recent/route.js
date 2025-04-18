import { NextResponse } from 'next/server';
import { getRecentGames } from '@/lib/igdb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || 20;
  
  try {
    const games = await getRecentGames(parseInt(limit));
    return NextResponse.json(games);
  } catch (error) {
    console.error('Recent games fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent games', details: error.message },
      { status: 500 }
    );
  }
}