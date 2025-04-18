'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface GameDetailsParams {
  params: {
    id: string;
  };
}

export default function GameDetailsPage({ params }) {
  const id = params?.id;
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGameDetails() {
      try {
        const response = await fetch(`/api/games/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }
        
        const data = await response.json();
        setGame(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGameDetails();
  }, [id]);

  // Format date from UNIX timestamp
  const formatReleaseDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

// Get image URL with proper size
const getImageUrl = (url) => {
    if (!url) return '/placeholder-game.jpg';
    
    // Convert protocol-relative URL to absolute URL
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }
    
    // Replace the original size with screenshot size
    return url.replace('t_thumb', 't_screenshot_big');
  };
  
  // Get cover image URL
  const getCoverUrl = (url) => {
    if (!url) return '/placeholder-game.jpg';
    
    // Convert protocol-relative URL to absolute URL
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }
    
    return url.replace('t_thumb', 't_cover_big');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl">Loading game details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl text-red-600">Error: {error}</p>
        <Link href="/games" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Games
        </Link>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl">Game not found</p>
        <Link href="/games" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Games
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/games" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Games
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Game Cover */}
        <div className="md:col-span-1">
          <div className="relative w-full h-96 md:h-auto rounded-lg overflow-hidden">
            <Image 
              src={game.cover ? getCoverUrl(game.cover.url) : '/placeholder-game.jpg'}
              alt={game.name}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-lg"
            />
          </div>
          
          {/* Game Info */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-black">
            <h2 className="text-xl font-bold mb-4">Game Info</h2>
            
            <div className="mb-3">
              <p className="font-semibold">Release Date:</p>
              <p>{formatReleaseDate(game.first_release_date)}</p>
            </div>
            
            {game.rating && (
              <div className="mb-3">
                <p className="font-semibold">User Rating:</p>
                <p>{Math.round(game.rating)}% ({game.rating_count} ratings)</p>
              </div>
            )}
            
            {game.genres && game.genres.length > 0 && (
              <div className="mb-3">
                <p className="font-semibold">Genres:</p>
                <p>{game.genres.map(g => g.name).join(', ')}</p>
              </div>
            )}
            
            {game.platforms && game.platforms.length > 0 && (
              <div className="mb-3">
                <p className="font-semibold">Platforms:</p>
                <p>{game.platforms.map(p => p.name).join(', ')}</p>
              </div>
            )}
            
            {game.involved_companies && game.involved_companies.length > 0 && (
              <div className="mb-3">
                <p className="font-semibold">Companies:</p>
                <p>{game.involved_companies.map(c => c.company.name).join(', ')}</p>
              </div>
            )}
            
            {/* Add a button to add a review */}
            <Link 
              href={`/reviews/create?gameId=${game.id}&gameName=${encodeURIComponent(game.name)}&gameImage=${encodeURIComponent(game.cover ? game.cover.url : '')}`}
              className="mt-4 block w-full py-2 px-4 bg-indigo-600 text-white text-center rounded-md hover:bg-indigo-700"
            >
              Write a Review
            </Link>
          </div>
        </div>
        
        {/* Game Content */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{game.name}</h1>
          
          {/* Summary */}
          {game.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Summary</h2>
              <p className="text-white">{game.summary}</p>
            </div>
          )}
          
          {/* Storyline */}
          {game.storyline && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Storyline</h2>
              <p className="text-white">{game.storyline}</p>
            </div>
          )}
          
          {/* Screenshots */}
          {game.screenshots && game.screenshots.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Screenshots</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {game.screenshots.slice(0, 4).map((screenshot, index) => (
                  <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                    <Image 
                      src={getImageUrl(screenshot.url)}
                      alt={`${game.name} screenshot ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Similar Games */}
          {game.similar_games && game.similar_games.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Similar Games</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {game.similar_games.slice(0, 4).map((similarGame) => (
                  <Link href={`/games/${similarGame.id}`} key={similarGame.id} className="block">
                    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                      <div className="h-32 relative">
                        <Image 
                          src={similarGame.cover ? getCoverUrl(similarGame.cover.url) : '/placeholder-game.jpg'}
                          alt={similarGame.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm truncate">{similarGame.name}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Website Links */}
          {game.websites && game.websites.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Official Links</h2>
              <div className="flex flex-wrap gap-2">
                {game.websites.map((website, index) => {
                  // Determine website type
                  let siteName = 'Official Site';
                  switch (website.category) {
                    case 1: siteName = 'Official Site'; break;
                    case 2: siteName = 'Wikipedia'; break;
                    case 3: siteName = 'Twitter'; break;
                    case 4: siteName = 'Twitch'; break;
                    case 5: siteName = 'Instagram'; break;
                    case 6: siteName = 'YouTube'; break;
                    case 8: siteName = 'Facebook'; break;
                    case 9: siteName = 'Discord'; break;
                    case 13: siteName = 'Steam'; break;
                    case 14: siteName = 'Reddit'; break;
                    default: siteName = 'Website';
                  }
                  
                  return (
                    <a 
                      key={index}
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
                    >
                      {siteName}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}