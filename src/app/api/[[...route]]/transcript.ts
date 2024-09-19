import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import fs from 'fs/promises'
import { createReadStream } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in the environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const app = new Hono()

app.post('/', async (c) => {
  console.log('Transcribing...')
  console.log('Request headers:', c.req.header())
  const body = await c.req.parseBody()
  console.log('Parsed body:', body)
  console.log('Parsed body keys:', Object.keys(body))

  let audioFile;
  if (body.audio && body.audio instanceof File) {
    console.log('Audio file found')
    console.log('Audio file type:', body.audio.type)
    console.log('Audio file name:', body.audio.name)
    console.log('Audio file size:', body.audio.size)
    audioFile = body.audio;
  } else {
    console.log('No valid audio file found in body')
    console.log('Body content:', body)
  }

  if (!audioFile) {
    throw new HTTPException(400, { message: 'No valid audio file provided' })
  }

  // Create a temporary file
  const tempDir = path.join(process.cwd(), 'tmp')
  await fs.mkdir(tempDir, { recursive: true })
  const tempFilePath = path.join(tempDir, `${uuidv4()}.mp3`)
console.log('tempFilePath:', tempFilePath)
  try {
    // Write the audio file to disk
    const arrayBuffer = await audioFile.arrayBuffer()
    await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer))

    // Create a readable stream from the file
    const fileStream = createReadStream(tempFilePath)

    // Call OpenAI API
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
    })

    return c.json({ transcription: transcription.text })
  } catch (error) {
    console.error('Error during transcription:', error)
    if (error instanceof OpenAI.APIError) {
      throw new HTTPException(500, { message: `OpenAI API error: ${error.message}` })
    } else {
      throw new HTTPException(500, { message: 'An unexpected error occurred during transcription' })
    }
  } finally {
    // Clean up: delete the temporary file
    await fs.unlink(tempFilePath).catch(console.error)
  }
})

export async function transcribeMP3(file: File): Promise<{ transcription: string }> {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: (() => {
      const formData = new FormData()
      formData.append('audio', file)
      return formData
    })(),
  })

  if (!response.ok) {
    throw new Error('Transcription failed')
  }

  return response.json()
}

export default app