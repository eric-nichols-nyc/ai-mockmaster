import { Hono } from 'hono'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { getGoogleCredentials } from '@/lib/googleAuth'
const app = new Hono()

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

async function uploadToS3(audioBuffer:Buffer, fileName:string) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `audio/${fileName}`,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
  }

  try {
    const command = new PutObjectCommand(params)
    await s3Client.send(command)
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/audio/${fileName}`
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw error
  }
}

// Initialize the Google Generative AI
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!

// throw error is no API key is provided
if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable')
}
//const genAI = new GoogleGenerativeAI(apiKey)

// const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-flash",
// })

// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 64,
//   maxOutputTokens: 8192,
//   responseMimeType: "text/plain",
// }

// const safetySettings = [
//   {
//     category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//     threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
//   },
//   {
//     category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//     threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
//   },
// ]

// // Define the schema for input validation
// const questionSchema = z.object({
//   message: z.string().min(1, 'Message is required'),
// })

// app.post('/getquestion', zValidator('json', questionSchema), async (c) => {
//   try {
//     const { message } = await c.req.valid('json')

//     const chatSession = model.startChat({
//       generationConfig,
//       safetySettings
//     })

//     const result = await chatSession.sendMessage(message)
//     const response = result.response.text()

//     return c.json({ response })
//   } catch (error) {
//     console.error('Error:', error)
//     return c.json({ error: 'An error occurred while processing your request' }, 500)
//   }
// })

app.post('/getquestion', async (c) => {
  try{
    const auth = getGoogleCredentials();
    // Get the API key from the credentials
    const apiKey = 'AIzaSyCWmgdu2DHChAlX56L5sVGncpzGWehtAKQ';
    console.log('apiKey: ' + apiKey);
   // Generate question from Google's generative AI
   const genAI = new GoogleGenerativeAI(apiKey!)
   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
   const result = await model.generateContent("Generate a random question")
   const question = result.response.text()

    // Create audio file from the question
    const ttsClient = new TextToSpeechClient()
    const [ttsResponse] = await ttsClient.synthesizeSpeech({
      input: { text: question },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    })

    // Ensure audioContent is a Buffer
    if (!(ttsResponse.audioContent instanceof Buffer)) {
      throw new Error('audioContent is not a Buffer')
    }

    // Upload audio to S3
    const fileName = `question-${Date.now()}.mp3`
    const audioUrl = await uploadToS3(ttsResponse.audioContent, fileName)

    return c.json({ question, audioUrl })

  }catch(error){
    console.error('Error:', error)
    return c.json({ error: 'Error processing request' }, 500)
  }
})

export default app