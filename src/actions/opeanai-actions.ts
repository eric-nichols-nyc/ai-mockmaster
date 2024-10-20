"use server"

import { generateText } from 'ai';
import {geminiProModel} from "./index"
import { z } from "zod"

// Define Zod schemas for route validation
const GenerateQuestionsSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().optional(),
  skills: z.array(z.string()).optional(),
})


export async function generateQuestions(data: z.infer<typeof GenerateQuestionsSchema>) {
  try {
    const validatedData = GenerateQuestionsSchema.parse(data)
    const start = performance.now()

    // Construct prompt for OpenAI with an example
    const prompt = `Generate 1 interview question based on the following information:
    Title: ${validatedData.jobTitle}
    ${validatedData.jobDescription ? `Description: ${validatedData.jobDescription}` : ''}
    ${validatedData.skills ? `Required Skills: ${validatedData.skills.join(', ')}` : ''}
    
    Ensure the question is relevant to the provided information and suitable for the position. The suggested answer should be comprehensive and demonstrate a strong understanding of the topic. If no skills were provided, infer relevant skills based on the job title${validatedData.jobDescription ? ' and description' : ''}.

    Here's an example of the expected output format:
    {
      "questions": [
        {
          "question": "Can you explain the concept of dependency injection and how it's used in software development?",
          "suggested": "Dependency Injection (DI) is a design pattern used in software development to achieve Inversion of Control (IoC) between classes and their dependencies. It allows for loosely coupled code by removing the responsibility of creating and managing dependencies from a class.\n\nIn practice, instead of a class creating its own dependencies, they are 'injected' into the class from an external source. This can be done through constructor injection, setter injection, or interface injection.\n\nBenefits of using DI include:\n1. Improved testability: Dependencies can be easily mocked or stubbed.\n2. Increased modularity: Classes are more independent and reusable.\n3. Greater flexibility: Dependencies can be swapped without changing the class code.\n4. Better maintainability: Changes to dependencies don't require changes to the dependent classes.\n\nMany modern frameworks and libraries, such as Spring in Java or Angular in JavaScript, have built-in DI containers that manage the creation and lifecycle of objects and their dependencies.\n\nAn example in pseudocode:\n\nWithout DI:\nclass Car {\n  engine = new Engine()\n  // Car creates its own Engine dependency\n}\n\nWith DI:\nclass Car {\n  constructor(engine) {\n    this.engine = engine\n    // Engine is injected into Car\n  }\n}\n\nThis pattern is particularly useful in large, complex applications where managing dependencies manually would be cumbersome and error-prone."
        }
      ]
    }

    Please generate a similar question and answer based on the provided job information. Do not include the 'saved' field in your response.`

    const object  = await generateText({
      model: geminiProModel,
      prompt,
    })
    console.log('================ ', object)

    const end = performance.now()
    const test  = JSON.parse(object.text)
    return {result: test, timeTaken: end - start}  

  } catch (error) {
    console.error('Question and Answer Generation Error:', error)
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.errors))
    }
    throw new Error('Failed to generate interview questions and answers')
  }
}
