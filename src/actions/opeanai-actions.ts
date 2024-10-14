"use server"

import { OpenAI } from "openai"
import { z } from "zod"

// Define Zod schemas for route validation
const GenerateQuestionsSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().optional(),
  skills: z.array(z.string()).optional(),
})

const openai = new OpenAI()

export async function generateQuestions(data: z.infer<typeof GenerateQuestionsSchema>) {
  try {
    const validatedData = GenerateQuestionsSchema.parse(data)
    const start = performance.now()

    // Construct prompt for OpenAI
    const prompt = `Generate 1 interview questions based on the following information:
    Title: ${validatedData.jobTitle}
    ${validatedData.jobDescription ? `Description: ${validatedData.jobDescription}` : ''}
    ${validatedData.skills ? `Required Skills: ${validatedData.skills.join(', ')}` : ''}
    
    Provide the questions, suggested answers should include the related skills in the following JSON format:
    {
      "questions": [
        {
          "question": "Question text here",
          "suggested": "A detailed suggested answer for the question",
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
    const end = performance.now()

    return {result:questionsAndAnswers, timeTaken: end - start}

  } catch (error) {
    console.error('Question and Answer Generation Error:', error)
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.errors))
    }
    throw new Error('Failed to generate interview questions and answers')
  }
}
