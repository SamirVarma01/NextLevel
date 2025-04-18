'use client';

import GameReviews from '@/components/GameReviews';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`/api/reviews?page=${currentPage}&limit=10`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data.reviews);
        setTotalPages(data.pagination.pages);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    }
    
    fetchReviews();
  }, [currentPage]);
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  if (loading && reviews.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl">Loading reviews...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Game Reviews</h1>
        <Link
          href="/reviews/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Write a Review
        </Link>
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600 mb-4">No reviews yet. Be the first to write one!</p>
          <Link 
            href="/reviews/create" 
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700"
          >
            Write a Review
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Link key={review._id} href={`/reviews/${review._id}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row">
                  {/* Game Image */}
                  <div className="md:w-1/4 h-48 md:h-auto relative">
                    <Image 
                      src={review.gameImage || '/placeholder-game.jpg'} 
                      alt={review.gameName}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  
                  {/* Review Content */}
                  <div className="md:w-3/4 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold">{review.title}</h2>
                      <div className="px-3 py-1 bg-indigo-600 text-white rounded-full font-bold">
                        {review.rating}/10
                      </div>
                    </div>
                    
                    <h3 className="text-gray-600 mb-3">{review.gameName}</h3>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 relative rounded-full overflow-hidden mr-3">
                        <Image 
                          src={review.user.profilePicture || '/default-avatar.png'} 
                          alt={review.user.username}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-black">{review.user.username}</p>
                        <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 line-clamp-3 text-black">
                      {review.content}
                    </p>
                    
                    <div className="flex mt-4 text-sm text-gray-600">
                      <div className="flex items-center mr-4">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                        </svg>
                        {review.likes || 0} likes
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        {review.comments?.length || 0} comments
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === page 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Reviews Section */}
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">User Reviews</h2>
                <Link 
                    href="/reviews/create"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                Write a Review
                </Link>
            </div>
  
            <GameReviews />
        </div>
    </div>
  );
}