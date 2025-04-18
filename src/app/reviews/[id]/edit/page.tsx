'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function EditReviewPage({ params }) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [review, setReview] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(7);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch review data
  useEffect(() => {
    async function fetchReview() {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/reviews/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch review');
        }
        
        const data = await response.json();
        setReview(data);
        
        // Initialize form fields
        setTitle(data.title || '');
        setContent(data.content || '');
        setRating(data.rating || 7);
      } catch (error) {
        console.error('Error fetching review:', error);
        setError('Failed to load review');
      } finally {
        setLoading(false);
      }
    }
    
    fetchReview();
  }, [id]);
  
  // Check authentication and ownership
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (review && session && review.user._id !== session.user.id) {
      router.push(`/reviews/${id}`);
    }
  }, [review, session, status, id, router]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    if (content.length < 50) {
      setError('Review content must be at least 50 characters long');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          rating,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update review');
      }
      
      router.push(`/reviews/${id}`);
    } catch (error) {
      console.error('Error updating review:', error);
      setError(error.message || 'Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl">Loading review...</p>
      </div>
    );
  }
  
  if (!review) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl text-red-600">Review not found</p>
        <Link href="/reviews" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to all reviews
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Review</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        {/* Game Info */}
        <div className="p-6 border-b">
          <div className="flex items-center">
            <div className="w-20 h-20 relative mr-4">
              <Image 
                src={review.gameImage || '/placeholder-game.jpg'} 
                alt={review.gameName}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">{review.gameName}</h2>
              <Link href={`/games/${review.gameId}`} className="text-indigo-600 hover:underline">
                View game details
              </Link>
            </div>
          </div>
        </div>
        
        {/* Review Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 text-black">
                Review Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md text-black"
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
                className="w-full p-2 border rounded-md h-64 text-black"
                required
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                {content.length}/50 characters minimum
              </p>
            </div>
            
            <div className="flex justify-end pt-4">
              <Link
                href={`/reviews/${id}`}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {submitting ? 'Updating...' : 'Update Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}