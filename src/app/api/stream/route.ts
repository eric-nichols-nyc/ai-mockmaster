import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

async function generateChatCompletion(title: string, question: string, answer: string, skills: string) {
  console.log('Generating chat completion with:', { title, question, answer, skills })
  return await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert skill assessor. Provide detailed assessments based on the given information. Format your response in JSON with the following structure: {"questionAddressed": "...", "skillsDemonstrated": "...", "strengths": "...", "areasForImprovement": "...", "overallScore": "..."}'
      },
      {
        role: 'user',
        content: `
          Title: ${title}
          Question: ${question}
          Answer: ${answer}
          Skills: ${skills}

          Based on the above information, provide a detailed assessment of the answer. 
          Consider the following:
          1. How well does the answer address the question?
          2. Which of the listed skills are demonstrated in the answer?
          3. What are the strengths of the answer?
          4. What areas could be improved?
          5. Provide an overall score out of 10 and justify it.

          Present your assessment in the specified JSON format.
        `
      }
    ],
    max_tokens: 1000,
    temperature: 0.7,
  })
}

async function handleStreamingResponse(title: string, question: string, answer: string, skills: string) {
  console.log('Handling streaming response')
  const response = await generateChatCompletion(title, question, answer, skills)
  console.log('response ')
  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}

async function handleNonStreamingResponse(title: string, question: string, answer: string, skills: string) {
  console.log('Handling non-streaming response')
  const response = await generateChatCompletion(title, question, answer, skills)
  const result = await response.json()
  const assessment = result.choices[0].message.content
  return new Response(assessment, {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST(req: Request) {
  try {
    console.log('Received POST request')
    const { prompt, streaming } = await req.json()
    console.log('Request body:', { prompt, streaming })
    const { title, question, answer, skills } = JSON.parse(prompt)
    console.log('Parsed data:', { title, question, answer, skills, streaming })

    if (!title || !question || !answer || !skills) {
      console.error('Missing required fields')
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (streaming) {
      return await handleStreamingResponse(title, question, answer, skills)
    } else {
      return await handleNonStreamingResponse(title, question, answer, skills)
    }
  } catch (error) {
    console.error('Error in API route:', error)
    return new Response(JSON.stringify({ error: 'An error occurred while processing your request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
