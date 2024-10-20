'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "you are tech interviewer: based on {job_postion}, {skills}, {description} \n- give me a question that includes one or all of the skills. \n- Provide a suggested answer to the question in one paragraph. \n- provide the question and suggested answer in JSON format.",
  });

const generationConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 1024,
  responseMimeType: "text/plain",
};

const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {text: "job_postions: frontend developer\nskills: react, redux\ndescription: Performs hands-on architecture, design, and development of systems"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n{\n  \"question\": \"Describe a scenario where you would use Redux in a React application, and explain the benefits it provides over managing state directly within React components.\",\n  \"suggested\": \"One scenario where Redux is beneficial is when managing complex application state that is shared across multiple components. For example, in an e-commerce application, Redux could be used to store and manage the user's shopping cart. This centralized state management allows components to access and update the cart state without directly communicating with each other, promoting code reusability and maintainability. Additionally, Redux provides features like time-travel debugging, which allows developers to inspect and replay state changes, making it easier to identify and fix issues.\"\n}\n```"},
        ],
      },
    ],
  });

export async function generateTechInterviewQuestion(
  jobTitle: string,
  jobDescription: string | undefined,
  skills: string[] | undefined
) {
  try {
    const input = `job_position: ${jobTitle}
${jobDescription ? `description: ${jobDescription}` : ''}
${skills ? `skills: ${skills.join(', ')}` : ''}`;

    const result = await chatSession.sendMessage(input);
    const response = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Failed to parse JSON from response');
    }
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to generate tech interview question');
  }
}

