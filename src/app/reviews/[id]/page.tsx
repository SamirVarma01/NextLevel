'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ReviewDetailPage({ params }) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  
  useEffect(() => {
    async function fetchReview() {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`/api/reviews/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Review not found');
          }
          throw new Error('Failed to fetch review');
        }
        
        const data = await response.json();
        setReview(data);
      } catch (error) {
        console.error('Error fetching review:', error);
        setError(error.message || 'Failed to load review');
      } finally {
        setLoading(false);
      }
    }
    
    fetchReview();
  }, [id]);
  
  const handleLike = async () => {
    if (status !== 'authenticated') {
      router.push(`/login?redirect=/reviews/${id}`);
      return;
    }
    
    try {
      setLiking(true);
      
      const response = await fetch(`/api/reviews/${id}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to like review');
      }
      
      const data = await response.json();
      
      setReview(prev => ({
        ...prev,
        likes: data.likes,
        likedBy: data.liked 
          ? [...(prev.likedBy || []), session.user.id]
          : (prev.likedBy || []).filter(userId => userId !== session.user.id)
      }));
    } catch (error) {
      console.error('Error liking review:', error);
    } finally {
      setLiking(false);
    }
  };
  
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (status !== 'authenticated') {
      router.push(`/login?redirect=/reviews/${id}`);
      return;
    }
    
    if (!comment.trim()) {
      return;
    }
    
    try {
      setSubmittingComment(true);
      
      const response = await fetch(`/api/reviews/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      
      const data = await response.json();
      
      // Add new comment to the list
      setReview(prev => ({
        ...prev,
        comments: [data.comment, ...(prev.comments || [])],
      }));
      
      // Clear comment form
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      router.push('/profile');
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl">Loading review...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl text-red-600">{error}</p>
        <Link href="/reviews" className="mt-4 inline-block text-indigo-600 hover:underline">
          View all reviews
        </Link>
      </div>
    );
  }
  
  if (!review) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl">Review not found</p>
        <Link href="/reviews" className="mt-4 inline-block text-indigo-600 hover:underline">
          View all reviews
        </Link>
      </div>
    );
  }
  
  const isAuthor = session?.user.id === review.user._id;
  const hasLiked = review.likedBy?.includes(session?.user.id);
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/reviews" className="text-indigo-600 hover:underline">
          &larr; Back to all reviews
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        {/* Review Header */}
        <div className="bg-indigo-600 text-white p-6">
          <h1 className="text-3xl font-bold mb-2">{review.title}</h1>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/games/${review.gameId}`} className="text-white hover:underline">
              {review.gameName}
            </Link>
            <div className="px-3 py-1 bg-indigo-800 rounded-full font-bold">
              {review.rating}/10
            </div>
            <span>
              Published on {formattedDate}
            </span>
          </div>
        </div>
        
        {/* Review Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Game Image */}
            <div className="md:w-1/4">
              <div className="rounded-lg overflow-hidden">
                <Link href={`/games/${review.gameId}`}>
                  <div className="h-64 md:h-auto relative">
                    <Image 
                      src={review.gameImage || '/placeholder-game.jpg'} 
                      alt={review.gameName}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Review Text */}
            <div className="md:w-3/4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 relative rounded-full overflow-hidden mr-3">
                  <Image 
                    src={review.user.profilePicture || '/default-avatar.png'} 
                    alt={review.user.username}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <Link href={`/profile/${review.user._id}`} className="font-medium hover:underline text-black">
                  {review.user.username}
                </Link>
              </div>
              
              <div className="prose max-w-none text-black">
                {review.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-between items-center border-t pt-4">
            <div className="flex gap-4 text-black">
              <button 
                onClick={handleLike}
                disabled={liking || !session}
                className={`flex items-center gap-1 px-3 py-1 rounded-full ${hasLiked ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                </svg>
                <span>{review.likes || 0}</span>
              </button>
              
              <button 
                onClick={() => document.getElementById('commentForm').focus()}
                className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span>{review.comments?.length || 0}</span>
              </button>
            </div>
            
            {isAuthor && (
              <div className="flex gap-2">
                <Link 
                  href={`/reviews/${id}/edit`}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Edit
                </Link>
                <button 
                  onClick={handleDeleteReview}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-black">Comments</h2>
        </div>
        
        {/* Comment Form */}
        <div className="p-6 border-b">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div>
              <textarea
                id="commentForm"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={session ? "Add a comment..." : "Log in to add a comment"}
                className="w-full p-2 border rounded-md text-gray-900 bg-white placeholder-gray-500"
                disabled={!session || submittingComment}
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              {session ? (
                <button
                  type="submit"
                  disabled={submittingComment || !comment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              ) : (
                <Link 
                  href={`/login?redirect=/reviews/${id}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Log in to Comment
                </Link>
              )}
            </div>
          </form>
        </div>
        
        {/* Comments List */}
        <div className="p-6">
          {review.comments && review.comments.length > 0 ? (
            <div className="space-y-6">
              {review.comments.map((comment) => (
                <div key={comment._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 relative rounded-full overflow-hidden mr-3">
                      <Image 
                        src={comment.user.profilePicture || '/default-avatar.png'} 
                        alt={comment.user.username}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <Link href={`/profile/${comment.user._id}`} className="font-medium hover:underline text-black">
                        {comment.user.username}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-black">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-black">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}