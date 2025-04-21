const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

const s3 = new S3Client();

exports.handler = async (event) => {
  try {
    // Get the uploaded object details from the event
    const sourceBucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    
    // Skip processing if this is already a processed image
    if (key.includes('processed-')) {
      console.log('Already processed image. Skipping.');
      return;
    }
    
    // Get the object from S3
    const getObjectParams = {
      Bucket: sourceBucket,
      Key: key
    };
    
    const { Body: imageBuffer } = await s3.send(new GetObjectCommand(getObjectParams));
    
    // Check if the file is an image
    if (!key.match(/\.(jpg|jpeg|png|gif)$/i)) {
      console.log(`Skipping non-image file: ${key}`);
      return;
    }
    
    // Generate image variants
    const fileNameParts = key.split('.');
    const fileExtension = fileNameParts.pop();
    const fileName = fileNameParts.join('.');
    
    // Process for profile pics (resize to 200x200)
    let profileImage;
    if (key.includes('profile')) {
      profileImage = await sharp(await streamToBuffer(imageBuffer))
        .resize(200, 200)
        .toBuffer();
    }
    
    // Process for game covers (resize to different dimensions)
    let standardImage = await sharp(await streamToBuffer(imageBuffer))
      .resize(800, null) // Resize to 800px width, maintain aspect ratio
      .toBuffer();
    
    let thumbnailImage = await sharp(await streamToBuffer(imageBuffer))
      .resize(400, null) // Resize to 400px width, maintain aspect ratio
      .toBuffer();
    
    // Upload processed images back to S3
    const destinationBucket = 'nextlevel-processed';
    
    const uploadPromises = [];
    
    // Upload standard image
    uploadPromises.push(
      s3.send(new PutObjectCommand({
        Bucket: destinationBucket,
        Key: `standard-${key}`,
        Body: standardImage,
        ContentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`
      }))
    );
    
    // Upload thumbnail
    uploadPromises.push(
      s3.send(new PutObjectCommand({
        Bucket: destinationBucket,
        Key: `thumbnail-${key}`,
        Body: thumbnailImage,
        ContentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`
      }))
    );
    
    // Upload profile image if applicable
    if (profileImage) {
      uploadPromises.push(
        s3.send(new PutObjectCommand({
          Bucket: destinationBucket,
          Key: `profile-${key}`,
          Body: profileImage,
          ContentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`
        }))
      );
    }
    
    await Promise.all(uploadPromises);
    
    console.log(`Successfully processed ${key}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Image processing complete' }),
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing image' }),
    };
  }
};

// Helper function to convert stream to buffer
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}