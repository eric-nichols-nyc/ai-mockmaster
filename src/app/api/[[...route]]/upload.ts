import { Hono } from 'hono';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';

const app = new Hono();

// Check for required environment variables
const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

app.post('/api/upload', async (c) => {
  const body = await c.req.parseBody();
  const audioFile = body.audio;

  if (!audioFile || !(audioFile instanceof File)) {
    return c.json({ error: 'No audio file provided' }, 400);
  }

  const key = `audio-${Date.now()}.webm`;

  const params: PutObjectCommandInput = {
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: key,
    Body: new Uint8Array(await audioFile.arrayBuffer()),
    ContentType: audioFile.type,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return c.json({ url });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return c.json({ error: 'Error uploading to S3' }, 500);
  }
});

export default app;