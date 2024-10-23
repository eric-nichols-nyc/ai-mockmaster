// Import necessary dependencies
import { Hono } from 'hono'
import { OpenAI } from 'openai'
import { v4 as uuidv4 } from 'uuid'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { z } from 'zod'
import { evaluationPrompt } from '@/lib/prompts'
import { GetResultsSchema } from '@/lib/schemas'

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

// Define Zod schemas for route validation
const GenerateQuestionsSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().optional(),
  skills: z.array(z.string()).optional(),
})

const TextToSpeechSchema = z.object({
  text: z.string().min(1, "Text is required"),
})

const TranscribeSchema = z.object({
  audio: z.instanceof(File, { message: "Audio file is required" }),
})

// Route: Generate interview questions
app.post('/generate-questions', async (c) => {
  try {
    // Parse and validate request body
    const body = await c.req.json()
    const validatedData = GenerateQuestionsSchema.parse(body)

    // Construct prompt for OpenAI
    const prompt = `Generate 1 interview questions based on the following information:
    Title: ${validatedData.jobTitle}
    ${validatedData.jobDescription ? `Description: ${validatedData.jobDescription}` : ''}
    ${validatedData.skills ? `Required Skills: ${validatedData.skills.join(', ')}` : ''}
    
    Provide the questions, suggested answers, and related skills in the following JSON format:
    {
      "questions": [
        {
          "question": "Question text here",
          "suggested": "A detailed suggested answer for the question",
          "skills": ["skill1", "skill2"],
          "saved": false
        },
        ...
      ]
    }
    
    Ensure the questions are relevant to the provided information and cover a range of topics suitable for the position. The suggested answers should be comprehensive and demonstrate a strong understanding of the topic. For each question, include an array of skills that are most relevant to that specific question. If no skills were provided, infer relevant skills based on the job title${validatedData.jobDescription ? ' and description' : ''}.`

    // Call OpenAI API to generate questions and answers
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates interview questions and suggested answers." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    // Parse and return the generated questions and answers
    const questionsAndAnswers = JSON.parse(response.choices[0].message.content || '{"questions": []}')
    console.log('questionsAndAnswers = ', questionsAndAnswers)
    return c.json(questionsAndAnswers)

  } catch (error) {
    console.error('Question and Answer Generation Error:', error)
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Failed to generate interview questions and answers' }, 500)
  }
})

// Route: Convert text to speech
app.post('/text-to-speech', async (c) => {
  try {
    // Parse and validate request body
    const body = await c.req.json()
    const { text } = TextToSpeechSchema.parse(body)

    // Call OpenAI API to generate speech
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text,
    })

    // Get the audio data as a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Generate a unique filename
    const fileName = `${uuidv4()}.mp3`

    // Upload the audio file to S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `audio/${fileName}`,
      Body: buffer,
      ContentType: 'audio/mpeg',
    }

    await s3Client.send(new PutObjectCommand(uploadParams))

    // Generate the S3 URL for the uploaded file
    const audioUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/audio/${fileName}`

    return c.json({ audioUrl })

  } catch (error) {
    console.error('Text-to-Speech Error:', error)
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Failed to generate audio' }, 500)
  }
})

// Route: Transcribe audio
app.post('/transcribe', async (c) => {
  console.log('Transcribing...')
  try {
    const body = await c.req.parseBody()
    console.log('Received body:', body)

    // Validate and extract audio file from request
    const { audio } = TranscribeSchema.parse(body)
    console.log('Audio file received:', audio.name, audio.type, audio.size)

    // Upload audio file to S3
    const fileKey = `${uuidv4()}.webm`
    const arrayBuffer = await audio.arrayBuffer()
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: Buffer.from(arrayBuffer),
      ContentType: audio.type,
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
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    } else if (error instanceof OpenAI.APIError) {
      return c.json({ error: 'An error occurred with the OpenAI API' }, 500)
    } else {
      return c.json({ error: 'An unexpected error occurred during transcription or upload' }, 500)
    }
  }
})

app.post('/get-results', async (c) => {
  try {
    const body = await c.req.json()
    const { question, answer, position, skills } = GetResultsSchema.parse(body)

    const prompt = evaluationPrompt
      .replace('{question}', question)
      .replace('{answer}', answer)
      .replace('{position}', position)
      .replace('{skills}', skills ? skills.join(', ') : ''  )

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI assistant that provides interview evaluations in JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
      const evaluationResult = JSON.parse(response.choices[0].message.content.trim());
      return c.json(evaluationResult);
    } else {
      return c.json({ error: 'Invalid response from OpenAI API' }, 500);
    }
  } catch (error) {
    console.error('Error:', error)
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'An error occurred while processing your request' }, 500)
  }
})

export default app

// This file sets up an API using Hono framework to interact with OpenAI's services.
// It provides four main functionalities:
// 1. Generating interview questions based on job details and skills
// 2. Converting text to speech and uploading the audio to AWS S3
// 3. Transcribing audio files
// 4. Evaluating interview answers
//
// The app uses environment variables for API keys and AWS credentials.
// It integrates with AWS S3 for storing audio files during the text-to-speech and transcription processes.
//
// Each route (/generate-questions, /text-to-speech, /transcribe, /get-results) handles a specific task:
// - /generate-questions: Uses OpenAI's GPT model to create relevant interview questions, answers, and associated skills
// - /text-to-speech: Converts given text to speech using OpenAI's text-to-speech model and uploads the audio to S3
// - /transcribe: Uploads an audio file to S3, then uses OpenAI's Whisper model to transcribe it
// - /get-results: Evaluates a candidate's answer to an interview question, considering the job position and related skills
//
// Error handling is implemented for each route to manage potential issues with API calls or file handling.
// Zod schemas are used for input validation across all routes.
