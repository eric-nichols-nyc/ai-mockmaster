import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in the environment variables');
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
  throw new Error('AWS credentials or S3 bucket name are not set in the environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const app = new Hono()

app.post('/', async (c) => {
  console.log('Transcribing...')
  const body = await c.req.parseBody()

  let audioFile;
  if (body.audio && body.audio instanceof File) {
    audioFile = body.audio;
  } else {
    throw new HTTPException(400, { message: 'No valid audio file provided' })
  }

  try {
    // Upload to S3
    const fileKey = `${uuidv4()}.mp3`
    const arrayBuffer = await audioFile.arrayBuffer()
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: Buffer.from(arrayBuffer),
      ContentType: audioFile.type,
    }

    await s3Client.send(new PutObjectCommand(uploadParams))

    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`

    // Call OpenAI API with S3 URL
    const response = await fetch(s3Url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from S3: ${response.statusText}`)
    }
    const blob = await response.blob();
    const file = new File([blob], fileKey, { type: blob.type });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    })

    return c.json({ transcription: transcription.text, audioUrl: s3Url })
  } catch (error) {
    console.error('Error during transcription or upload:', error)
    if (error instanceof OpenAI.APIError) {
      throw new HTTPException(500, { message: 'An error occurred with the OpenAI API' })
    } else {
      throw new HTTPException(500, { message: 'An unexpected error occurred during transcription or upload' })
    }
  }
})

export default app