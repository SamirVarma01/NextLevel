import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Helper function to get profile image URL
export function getProfileImageUrl(userId) {
  return `https://nextlevel-processed.s3.amazonaws.com/profile-${userId}.jpg`;
}

// Helper function to get game image URL
export function getGameImageUrl(gameId, size = 'standard') {
  return `https://nextlevel-processed.s3.amazonaws.com/${size}-${gameId}.jpg`;
}

// Function to upload user profile image
export async function uploadUserProfileImage(file, userId) {
  const s3Client = new S3Client({ 
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });
  
  const fileExtension = file.name.split('.').pop();
  const fileName = `profile-${userId}.${fileExtension}`;
  
  const command = new PutObjectCommand({
    Bucket: "nextlevel-uploads",
    Key: fileName,
    Body: file,
    ContentType: file.type,
  });
  
  await s3Client.send(command);
  
  return `https://nextlevel-processed.s3.amazonaws.com/profile-${fileName}`;
}