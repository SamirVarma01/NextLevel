'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function GameReviews({ gameId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchGameReviews() {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/reviews?gameId=${gameId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch game reviews');
        }
        
        const data = await response.json();
        setReviews(data.reviews);
      } catch (error) {
        console.error('Error fetching game reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    }
    
    fetchGameReviews();
  }, [gameId]);
  
  if (loading) {
    return <p className="text-center py-4">Loading reviews...</p>;
  }
  
  if (error) {
    return <p className="text-center py-4 text-red-600">{error}</p>;
  }
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-2">No reviews yet for this game.</p>
        <p className="text-gray-600">Be the first to share your opinion!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Link key={review._id} href={`/reviews/${review._id}`}>
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">{review.title}</h3>
              <div className="px-3 py-1 bg-indigo-600 text-white rounded-full font-bold">
                {review.rating}/10
              </div>
            </div>
            
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
                <p className="font-medium">{review.user.username}</p>
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-3">{review.content}</p>
            
            <div className="flex text-sm text-gray-600">
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
        </Link>
      ))}
    </div>
  );
}