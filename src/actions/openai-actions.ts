import { OpenAI } from 'openai';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/db";
import { interviews, InterviewRecord } from "@/db/schema";
import { eq } from "drizzle-orm";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Initialize AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Define Zod schema for input validation
const GetResultsSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  position: z.string().min(1, "Position is required"),
  skills: z.array(z.string()),
});

// Evaluation prompt with example response
const evaluationPrompt = `
You are an expert interviewer and career coach. Your task is to evaluate a candidate's answer to an interview question for a specific job position. Provide a comprehensive assessment based on the following inputs:

1. Interview Question: {question}
2. Candidate's Answer: {answer}
3. Job Position: {position}
4. Related Skills: {skills}

Please provide your evaluation in the following JSON format:

{
  "feedback": "Detailed personal feedback on the candidate's answer, considering factors such as relevance, clarity, depth of knowledge, and alignment with the job position and related skills.",
  "grade": {
    "letter": "A letter grade (A, B, C, D, or F)",
    "explanation": "A brief explanation of why this grade was given"
  },
  "improvements": [
    "Improvement suggestion 1",
    "Improvement suggestion 2"
  ],
  "keyTakeaways": [
    "Key takeaway 1",
    "Key takeaway 2"
  ]
}

Here's an example of the expected response format:

{
  "feedback": "Your answer demonstrates a solid understanding of dependency injection and its benefits in software development. You've correctly identified key concepts such as Inversion of Control and loosely coupled code. Your explanation of the different types of injection (constructor, setter, interface) shows depth of knowledge. The example you provided illustrates the concept well, making it easier for the interviewer to gauge your practical understanding. Your mention of popular frameworks that use DI, like Spring and Angular, indicates familiarity with real-world applications of this pattern. To further improve, you could have discussed potential drawbacks or challenges of using DI, and perhaps mentioned how it relates to other design principles or patterns.",
  "grade": {
    "letter": "A",
    "explanation": "The answer is comprehensive, well-structured, and demonstrates both theoretical knowledge and practical understanding of dependency injection."
  },
  "improvements": [
    "Discuss potential drawbacks or challenges of using dependency injection",
    "Relate dependency injection to other SOLID principles or design patterns",
    "Provide a more complex real-world scenario where DI significantly improves code quality or maintainability"
  ],
  "keyTakeaways": [
    "Strong understanding of dependency injection and its benefits",
    "Ability to explain complex concepts clearly with relevant examples",
    "Awareness of how DI is used in popular frameworks, indicating practical knowledge"
  ]
}

Ensure that your response is a valid JSON object. Remember to tailor your evaluation to the specific job position and consider industry standards and expectations when providing feedback and suggestions. Make your response personal, conversational and engaging. Pay special attention to how well the candidate's answer addresses the related skills for the question.
`;

export async function getInterviewResults(data: z.infer<typeof GetResultsSchema>) {
  try {
    const { question, answer, position, skills } = GetResultsSchema.parse(data);

    const prompt = evaluationPrompt
      .replace('{question}', question)
      .replace('{answer}', answer)
      .replace('{position}', position)
      .replace('{skills}', skills.join(', '));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI assistant that provides interview evaluations in JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
      return JSON.parse(response.choices[0].message.content.trim());
    } else {
      throw new Error('Invalid response from OpenAI API');
    }
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.errors));
    }
    throw new Error('An error occurred while processing your request');
  }
}

// Define Zod schema for text-to-speech input validation
const TextToSpeechSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export async function generateSpeech(data: z.infer<typeof TextToSpeechSchema>) {
  try {
    const { text } = TextToSpeechSchema.parse(data);

    // Call OpenAI API to generate speech
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text,
    });

    // Get the audio data as a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Generate a unique filename
    const fileName = `${uuidv4()}.mp3`;

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

    return JSON.stringify({ audioUrl })

  } catch (error) {
    console.error('Text-to-Speech Error:', error)
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.errors));

    }
    throw new Error('Failed to generate audio');

  }
}

// Define Zod schema for fetchInterviewAndQuestion input validation
const FetchInterviewAndQuestionSchema = z.object({
  interviewId: z.string().uuid(),
  questionId: z.string().uuid(),
});

export async function fetchInterviewAndQuestion(data: z.infer<typeof FetchInterviewAndQuestionSchema>) {
  try {
    const { interviewId, questionId } = FetchInterviewAndQuestionSchema.parse(data);

    const fetchedInterview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
      with: {
        questions: true,
      },
    });

    if (!fetchedInterview) {
      throw new Error("Interview not found.");
    }

    const extendedInterview: InterviewRecord = {
      ...fetchedInterview,
      questions: Array.isArray(fetchedInterview.questions)
        ? fetchedInterview.questions
        : Object.values(fetchedInterview.questions || {}),
    };

    const foundQuestion = extendedInterview.questions.find(
      (q) => q.id === questionId
    );

    if (!foundQuestion) {
      throw new Error("Question not found.");
    }

    return {
      interview: extendedInterview,
      question: foundQuestion,
    };

  } catch (error) {
    console.error('Error in fetchInterviewAndQuestion:', error);
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.errors));
    }
    throw error;
  }
}
