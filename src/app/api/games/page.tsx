'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function GamesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popularGames, setPopularGames] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // Fetch popular games on page load
  useEffect(() => {
    async function fetchPopularGames() {
      try {
        const response = await fetch('/api/games/popular');
        if (!response.ok) throw new Error('Failed to fetch popular games');
        const data = await response.json();
        setPopularGames(data);
      } catch (error) {
        console.error('Error fetching popular games:', error);
      } finally {
        setLoadingPopular(false);
      }
    }

    fetchPopularGames();
  }, []);

  // Handle search
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/games/search?query=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date from UNIX timestamp
  const formatReleaseDate = (timestamp: number | undefined) => {
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
    
    // Replace the original size with thumbnail size
    return url.replace('t_thumb', 't_cover_big');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Games Library</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search games..." 
            className="flex-grow p-3 border border-gray-300 rounded-md"
          />
          <button 
            type="submit" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {/* Search Results */}
      {games.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <Link href={`/games/${game.id}`} key={game.id} className="block">
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="h-64 relative">
                    <Image 
                      src={game.cover ? getImageUrl(game.cover.url) : '/placeholder-game.jpg'}
                      alt={game.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{game.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Released: {formatReleaseDate(game.first_release_date)}
                    </p>
                    {game.rating && (
                      <p className="text-sm font-medium">
                        Rating: {Math.round(game.rating)}%
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Popular Games Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Popular Games</h2>
        {loadingPopular ? (
          <p>Loading popular games...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularGames.map((game) => (
              <Link href={`/games/${game.id}`} key={game.id} className="block">
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="h-64 relative">
                    <Image 
                      src={game.cover ? getImageUrl(game.cover.url) : '/placeholder-game.jpg'}
                      alt={game.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{game.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Released: {formatReleaseDate(game.first_release_date)}
                    </p>
                    <p className="text-sm font-medium">
                      Rating: {Math.round(game.rating)}%
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}