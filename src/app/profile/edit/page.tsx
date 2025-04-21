'use client';

import { uploadUserProfileImage, getProfileImageUrl } from '@/lib/s3-utils';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Fetch user data
  useEffect(() => {
    if (session?.user.id) {
      fetchUserData();
    }
  }, [session]);
  
  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${session.user.id}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const userData = await response.json();
      setUserData(userData);
      setUsername(userData.username || '');
      setBio(userData.bio || '');
      setImagePreview(userData.profilePicture || '/default-avatar.png');
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    }
  };
  
  // Handle image selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Display local preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        setProfileImage(file);
      } catch (error) {
        console.error('Error handling image:', error);
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // First, create FormData for non-image data
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      
      // If a new profile image was selected, upload it to S3
      let profileImageUrl = userData?.profilePicture;
      if (profileImage) {
        profileImageUrl = await uploadUserProfileImage(profileImage, session.user.id);
        formData.append('profilePicture', profileImageUrl);
      }
      
      // Send form data to API
      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }
      
      router.push('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading' || !userData) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-black">Edit Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Profile Picture */}
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">Profile Picture</label>
          <div className="flex items-center">
            <div className="w-24 h-24 relative rounded-full overflow-hidden mr-6 border-2 border-gray-300">
              <Image 
                src={imagePreview} 
                alt="Profile Preview"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image"
              />
              <label 
                htmlFor="profile-image"
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 cursor-pointer inline-block"
              >
                Choose Image
              </label>
            </div>
          </div>
        </div>
        
        {/* Username */}
        <div className="mb-6">
          <label htmlFor="username" className="block text-black font-medium mb-2">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-black"
            required
          />
        </div>
        
        {/* Bio */}
        <div className="mb-6">
          <label htmlFor="bio" className="block text-black font-medium mb-2">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md h-32 text-black"
          />
          <p className="text-sm text-gray-500 mt-1">Briefly tell others about yourself (500 characters max)</p>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Link 
            href="/profile"
            className="py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 text-black"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}