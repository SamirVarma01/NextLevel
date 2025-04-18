import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();
          
          // Find user by email
          const user = await User.findOne({ email: credentials.email }).select('+password');
          
          if (!user) {
            return null;
          }
          
          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          // Return user without password
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            profilePicture: user.profilePicture
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.profilePicture = user.profilePicture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.profilePicture = token.profilePicture;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };