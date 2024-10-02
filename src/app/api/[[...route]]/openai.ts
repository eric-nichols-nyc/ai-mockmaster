// Import necessary dependencies
import { Hono } from 'hono'
import { OpenAI } from 'openai'
import { HTTPException } from 'hono/http-exception'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Check for required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in the environment variables');
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
  throw new Error('AWS credentials or S3 bucket name are not set in the environment variables');
}

// Initialize Hono app
const app = new Hono()

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Route: Generate interview questions
app.post('/generate-questions', async (c) => {
  try {
    // Extract job details from request body
    const { jobTitle, jobDescription, skills } = await c.req.json()

    // Validate input
    if (!jobTitle || !jobDescription || !skills) {
      return c.json({ error: 'Title, description, and skills are required' }, 400)
    }

    // Construct prompt for OpenAI
    const prompt = `Generate 5 interview questions based on the following information:
    Title: ${jobTitle}
    Description: ${jobDescription}
    Required Skills: ${skills}
    
    Provide the questions and suggested answers in the following JSON format:
    {
      "questions": [
        {
          "question": "Question text here",
          "suggested": "A detailed suggested answer for the question"
        },
        ...
      ]
    }
    
    Ensure the questions are relevant to the provided information and cover a range of topics suitable for the position. The suggested answers should be comprehensive and demonstrate a strong understanding of the topic.`

    // Call OpenAI API to generate questions and answers
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates interview questions and suggested answers." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    // Parse and return the generated questions and answers
    const questionsAndAnswers = JSON.parse(response.choices[0].message.content || '{"questions": []}')
    console.log('questionsAndAnswers = ',questionsAndAnswers)
    return c.json(questionsAndAnswers)

  } catch (error) {
    console.error('Question and Answer Generation Error:', error)
    return c.json({ error: 'Failed to generate interview questions and answers' }, 500)
  }
})

// Route: Convert text to speech
app.post('/text-to-speech', async (c) => {
  try {
    // Extract text from request body
    const { text } = await c.req.json()

    // Validate input
    if (!text) {
      return c.json({ error: 'Text is required' }, 400)
    }

    // Call OpenAI API to generate speech
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text,
    })

    // Save the generated audio file
    const buffer = Buffer.from(await mp3.arrayBuffer())
    const fileName = `${uuidv4()}.mp3`
    const filePath = path.join(process.cwd(), 'public', 'audio', fileName)

    // Ensure the directory exists
    fs.mkdirSync(path.join(process.cwd(), 'public', 'audio'), { recursive: true })

    fs.writeFileSync(filePath, buffer)

    // Return the URL of the saved audio file
    const audioUrl = `/audio/${fileName}`
    return c.json({ audioUrl })

  } catch (error) {
    console.error('Text-to-Speech Error:', error)
    return c.json({ error: 'Failed to generate audio' }, 500)
  }
})

// Route: Transcribe audio
app.post('/transcribe', async (c) => {
  console.log('Transcribing...')
  const body = await c.req.parseBody()
  console.log('Received body:', body)

  // Validate and extract audio file from request
  let audioFile;
  if (body.audio && body.audio instanceof File) {
    audioFile = body.audio;
    console.log('Audio file received:', audioFile.name, audioFile.type, audioFile.size)
  } else {
    console.error('Invalid audio file:', body.audio)
    throw new HTTPException(400, { message: 'No valid audio file provided' })
  }
  
  try {
    // Upload audio file to S3
    const fileKey = `${uuidv4()}.webm`
    const arrayBuffer = await audioFile.arrayBuffer()
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: Buffer.from(arrayBuffer),
      ContentType: audioFile.type,
    }

    await s3Client.send(new PutObjectCommand(uploadParams))

    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`
    console.log('File uploaded to S3:', s3Url)

    // Fetch the uploaded file from S3
    const response = await fetch(s3Url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from S3: ${response.statusText}`)
    }
    const blob = await response.blob();
    const file = new File([blob], fileKey, { type: blob.type });

    // Call OpenAI API to transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    })

    console.log('Transcription completed:', transcription.text)
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

// This file sets up an API using Hono framework to interact with OpenAI's services.
// It provides three main functionalities:
// 1. Generating interview questions based on job details
// 2. Converting text to speech
// 3. Transcribing audio files
//
// The app uses environment variables for API keys and AWS credentials.
// It also integrates with AWS S3 for storing audio files during the transcription process.
//
// Each route (/generate-questions, /text-to-speech, /transcribe) handles a specific task:
// - /generate-questions: Uses OpenAI's GPT model to create relevant interview questions and answers
// - /text-to-speech: Converts given text to speech using OpenAI's text-to-speech model
// - /transcribe: Uploads an audio file to S3, then uses OpenAI's Whisper model to transcribe it
//
// Error handling is implemented for each route to manage potential issues with API calls or file handling.