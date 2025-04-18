'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    // Fetch user data and reviews if authenticated
    if (status === 'authenticated') {
      async function fetchUserData() {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      
      async function fetchUserReviews() {
        try {
          const response = await fetch(`/api/reviews/user/${session.user.id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch user reviews');
          }
          
          const data = await response.json();
          setUserReviews(data);
        } catch (error) {
          console.error('Error fetching user reviews:', error);
        } finally {
          setLoading(false);
        }
      }
      
      fetchUserData();
      fetchUserReviews();
    }
  }, [status, router, session]);

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Redirect happens in useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-indigo-600 text-white p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-white">
                <Image 
                  src={session.user.profilePicture || '/default-avatar.png'} 
                  alt={session.user.username}
                  width={96}
                  height={96}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{session.user.username}</h1>
                <p className="opacity-80">{session.user.email}</p>
              </div>
            </div>
            
            {/* Edit Profile Button */}
            <Link
              href="/profile/edit"
              className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 font-medium"
            >
              Edit Profile
            </Link>
          </div>
        </div>
        
        {/* Bio Section */}
        {userData?.bio && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold mb-3 text-black">About Me</h2>
            <p className="text-black">{userData.bio}</p>
          </div>
        )}
        
        {/* Profile Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-black">Your Reviews</h2>
          
          {userReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black mb-4">You haven&apos;t written any reviews yet.</p>
              <Link href="/games" className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700">
                Browse Games to Review
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userReviews.map((review) => (
                <Link key={review._id} href={`/reviews/${review._id}`}>
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="flex">
                      <div className="w-1/3">
                        <div className="h-full relative">
                          <Image 
                            src={review.gameImage || '/placeholder-game.jpg'} 
                            alt={review.gameName}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      </div>
                      <div className="w-2/3 p-4">
                        <h3 className="font-bold text-black">{review.title}</h3>
                        <p className="text-sm text-black mb-1">{review.gameName}</p>
                        <div className="flex items-center">
                          <span className="font-bold text-indigo-600">{review.rating}/10</span>
                          <span className="mx-2">•</span>
                          <span className="text-sm text-black">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}