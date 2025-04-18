'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Game {
  id: string;
  name: string;
  cover?: {
    url: string;
  };
  rating?: number;
}

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface Review {
  _id: string;
  title: string;
  content: string;
  rating: number;
  gameId: string;
  gameName: string;
  gameImage?: string;
  user?: User;
  createdAt: string;
}

export default function Home() {
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsResponse, gamesResponse] = await Promise.all([
          fetch('/api/reviews?limit=3'),
          fetch('/api/games/popular?limit=4')
        ]);
        
        const reviewsData = await reviewsResponse.json();
        const gamesData = await gamesResponse.json();
        
        setRecentReviews(reviewsData.reviews || []);
        setPopularGames(gamesData || []);
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Get image URL with proper size
  const getImageUrl = (url: string | undefined): string => {
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
      {/* Hero Section */}
      <div className="bg-indigo-600 text-white rounded-xl overflow-hidden shadow-xl mb-12">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Share Your Gaming Experience
            </h1>
            <p className="text-lg mb-6">
              Join our community of gamers to discover, review, and discuss your favorite video games.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/games" 
                className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium"
              >
                Browse Games
              </Link>
              <Link 
                href="/reviews" 
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-md font-medium"
              >
                Read Reviews
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 h-64 md:h-auto relative">
            <Image 
              src="/hero-image.jpg" 
              alt="Gaming" 
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Popular Games Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Popular Games</h2>
          <Link href="/games" className="text-indigo-600 hover:underline">
            View all games
          </Link>
        </div>
        
        {loading ? (
          <p className="text-center py-4">Loading games...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularGames.map((game) => (
              <Link href={`/games/${game.id}`} key={game.id} className="block">
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="h-48 relative">
                    <Image 
                      src={game.cover ? getImageUrl(game.cover.url) : '/placeholder-game.jpg'}
                      alt={game.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{game.name}</h3>
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
        )}
      </section>
      
      {/* Recent Reviews Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest Reviews</h2>
          <Link href="/reviews" className="text-indigo-600 hover:underline">
            View all reviews
          </Link>
        </div>
        
        {loading ? (
          <p className="text-center py-4">Loading reviews...</p>
        ) : recentReviews.length > 0 ? (
          <div className="space-y-6">
            {recentReviews.map((review) => (
              <Link key={review._id} href={`/reviews/${review._id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 h-48 md:h-auto relative">
                      <Image 
                        src={review.gameImage || '/placeholder-game.jpg'} 
                        alt={review.gameName}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="md:w-3/4 p-6">
                      <div className="flex flex-wrap justify-between items-center mb-2">
                        <h3 className="text-xl font-bold mr-2 text-black">{review.title}</h3>
                        <div className="px-3 py-1 bg-indigo-600 text-white rounded-full font-bold">
                          {review.rating}/10
                        </div>
                      </div>
                      <h4 className="text-gray-600 mb-3">{review.gameName}</h4>
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 relative rounded-full overflow-hidden mr-3">
                          <Image 
                            src={review.user?.profilePicture || '/default-avatar.png'} 
                            alt={review.user?.username || 'User'}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <p className="font-medium text-black">{review.user?.username || 'User'}</p>
                      </div>
                      <p className="text-gray-700 line-clamp-2">{review.content}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No reviews yet. Be the first to write one!</p>
          </div>
        )}
      </section>
      
      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Join Our Community?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-indigo-600 text-4xl mb-4 flex justify-center">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Share Your Opinion</h3>
            <p className="text-black">
              Write detailed reviews for your favorite (or not so favorite) games and help others find their next adventure.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-indigo-600 text-4xl mb-4 flex justify-center">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Join the Community</h3>
            <p className="text-gray-600">
              Connect with other gamers, discuss your favorite titles, and discover new games based on community recommendations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-indigo-600 text-4xl mb-4 flex justify-center">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Stay Up to Date</h3>
            <p className="text-gray-600">
              Get information on the latest releases, trending games, and discover hidden gems curated by our community.
            </p>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-xl text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Share Your Gaming Experience?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Join our community today and start sharing your reviews, connecting with other gamers, and discovering your next favorite game.
        </p>
        <Link 
          href="/register" 
          className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium text-lg inline-block"
        >
          Sign Up Now
        </Link>
      </section>
    </div>
  );
}