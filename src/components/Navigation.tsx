'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isAuthenticated = status === 'authenticated';

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">NextLevel</Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/games" className="hover:text-gray-300">Games</Link>
          <Link href="/reviews" className="hover:text-gray-300">Reviews</Link>
          
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="hover:text-gray-300">Profile</Link>
              <div className="relative">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-1 hover:text-gray-300"
                >
                  <span>{session.user.username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link 
                      href="/reviews/create" 
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Write a Review
                    </Link>
                    <button 
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                        setMenuOpen(false);
                      }} 
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">Log In</Link>
              <Link 
                href="/register" 
                className="bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Navigation Toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>
      
      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="md:hidden pt-4">
          <div className="flex flex-col space-y-3">
            <Link 
              href="/games" 
              className="hover:text-gray-300"
              onClick={() => setMenuOpen(false)}
            >
              Games
            </Link>
            <Link 
              href="/reviews" 
              className="hover:text-gray-300"
              onClick={() => setMenuOpen(false)}
            >
              Reviews
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  href="/profile" 
                  className="hover:text-gray-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  href="/reviews/create" 
                  className="hover:text-gray-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Write a Review
                </Link>
                <button 
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setMenuOpen(false);
                  }} 
                  className="text-left hover:text-gray-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="hover:text-gray-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded-md inline-block"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}