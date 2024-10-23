import { OpenAI } from 'openai';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/db";
import { interviews, InterviewRecord } from "@/db/schema";
import { eq } from "drizzle-orm";
import { evaluationPrompt } from '@/lib/prompts';
import { GetResultsSchema } from '@/lib/schemas';

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
