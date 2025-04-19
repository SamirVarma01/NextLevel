import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from './options';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };