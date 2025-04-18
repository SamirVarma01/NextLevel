'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CreateReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get game info from URL params if coming from a game page
  const gameId = searchParams.get('gameId');
  const gameName = searchParams.get('gameName');
  const gameImage = searchParams.get('gameImage');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(7);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/reviews/create');
    }
  }, [status, router]);

  // Set selected game if coming from a game page
  useEffect(() => {
    if (gameId && gameName) {
      setSelectedGame({
        id: gameId,
        name: gameName,
        image: gameImage && gameImage.startsWith('//') 
          ? `https:${gameImage}` 
          : gameImage || '/placeholder-game.jpg'
      });
    }
  }, [gameId, gameName, gameImage]);

  // Handle game search
  const handleGameSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    try {
      setSearching(true);
      setError('');
      
      const response = await fetch(`/api/games/search?query=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search games');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Game search error:', error);
      setError('Failed to search for games. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Select a game from search results
  const handleSelectGame = (game) => {
    setSelectedGame({
      id: game.id,
      name: game.name,
      image: game.cover ? 
        (game.cover.url.startsWith('//') ? `https:${game.cover.url}` : game.cover.url).replace('t_thumb', 't_cover_big') 
        : '/placeholder-game.jpg'
    });
    setSearchResults([]);
    setSearchTerm('');
  };

  // Handle review submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    if (!selectedGame) {
      setError('Please select a game to review');
      return;
    }
    
    if (!title.trim()) {
      setError('Please provide a review title');
      return;
    }
    
    if (content.length < 50) {
      setError('Your review must be at least 50 characters long');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: selectedGame.id,
          gameName: selectedGame.name,
          gameImage: selectedGame.image,
          title,
          content,
          rating
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }
      
      const data = await response.json();
      
      // Redirect to the new review
      router.push(`/reviews/${data.review._id}`);
    } catch (error) {
      console.error('Review submission error:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Write a Review</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        {/* Game Selection Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold mb-4 text-black">Step 1: Select a Game</h2>
          
          {selectedGame ? (
            <div className="flex items-center mb-4">
              <div className="w-20 h-20 relative mr-4">
                <Image 
                  src={selectedGame.image} 
                  alt={selectedGame.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded"
                />
              </div>
              <div>
                <p className="font-bold text-black">{selectedGame.name}</p>
                <button 
                  onClick={() => setSelectedGame(null)} 
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Change game
                </button>
              </div>
            </div>
          ) : (
            <div>
              <form onSubmit={handleGameSearch} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a game..."
                    className="flex-grow p-2 border rounded-md"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
              
              {searchResults.length > 0 && (
                <div className="border rounded-md">
                  <h3 className="p-2 bg-gray-100 font-semibold text-black">Select a game:</h3>
                  <ul className="max-h-60 overflow-y-auto">
                    {searchResults.map((game) => (
                      <li key={game.id} className="border-t">
                        <button
                          onClick={() => handleSelectGame(game)}
                          className="w-full p-2 text-left hover:bg-gray-50 flex items-center"
                        >
                          <div className="w-10 h-10 relative mr-2">
                            <Image
                              src={game.cover ? 
                                (game.cover.url.startsWith('//') ? `https:${game.cover.url}` : game.cover.url) 
                                : '/placeholder-game.jpg'}
                              alt={game.name}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="rounded"
                            />
                          </div>
                          <span>{game.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Review Form Section */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Step 2: Write Your Review</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Review Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a catchy title for your review"
                className="w-full p-2 border rounded-md text-gray-900 bg-white placeholder-gray-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                Rating (1-10)
              </label>
              <div className="flex items-center">
                <input
                  id="rating"
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="w-full max-w-md mr-3"
                />
                <span className="font-bold text-xl text-black">{rating}/10</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Review Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts on the game. What did you like or dislike? Would you recommend it?"
                className="w-full p-2 border rounded-md text-gray-900 bg-white placeholder-gray-500"
                required
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                {content.length}/50 characters minimum
              </p>
            </div>
            
            <div className="flex justify-end pt-4">
              <Link
                href="/games"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !selectedGame}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {submitting ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}