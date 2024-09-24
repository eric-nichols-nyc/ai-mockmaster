# AI MockMaster

## Project Overview

AI MockMaster is an AI-powered interview simulator designed to help users practice and improve their interviewing skills. It provides a realistic interview experience by generating questions, allowing users to record their answers, and providing feedback through transcription and analysis.

## Key Features

- AI-generated interview questions
- Audio recording of user responses
- Real-time audio visualization
- Speech-to-text transcription
- Text-to-speech for question playback
- Interview progress tracking
- Summary and feedback after completion

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API routes, Hono
- **Database**: PostgreSQL (with Neon serverless), Drizzle ORM
- **State Management**: Zustand
- **Styling**: Tailwind CSS, Radix UI
- **Authentication**: Clerk
- **APIs**: 
  - OpenAI for AI-powered features
  - Google Cloud Text-to-Speech
  - AWS S3 for audio storage
- **Testing**: Vitest, React Testing Library

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── interview/
│   │           ├── (components)/
│   │           │   ├── interview.tsx
│   │           │   ├── interview-form.tsx
│   │           │   ├── audio-recorder.tsx
│   │           │   └── visualizer.tsx
│   │           ├── page.tsx
│   │           ├── [id]/
│   │           │   ├── page.tsx
│   │           │   ├── start/
│   │           │   │   └── page.tsx
│   │           │   └── summary/
│   │           │       ├── page.tsx
│   │           │       └── summary.tsx
│   └── api/
│       └── [[...route]]/
│           ├── interviews.ts
│           ├── openai.ts
│           ├── route.ts
│           └── transcript.ts
├── components/
│   └── ui/
├── db/
│   ├── index.ts
│   └── schema.ts
├── lib/
│   └── api.ts
└── store/
    └── interviewStore.ts
```

## How It Works

1. **Interview Initialization**: Users start a new interview or continue an existing one.
2. **Question Generation**: AI generates interview questions based on the job description.
3. **Question Presentation**: The app presents questions one at a time.
4. **Audio Playback**: Users can listen to the question using text-to-speech functionality.
5. **Answer Recording**: Users record their answers using the built-in audio recorder.
6. **Real-time Visualization**: The app provides real-time audio visualization during recording.
7. **Transcription**: After recording, the answer is transcribed using a speech-to-text service.
8. **Answer Processing**: The transcribed answer is saved and associated with the current question.
9. **Progress Tracking**: Users can move to the next question or finish the interview.
10. **Summary and Feedback**: Upon completion, users can view a summary of their interview performance, including AI-generated feedback and improvements.

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see Environment Variables section)
4. Set up the database:
   - Ensure you have a Neon PostgreSQL database set up
   - Update the `NEON_DB_URL` in your `.env.local` file
   - Run database migrations (if applicable)
5. Start the development server: `npm run dev`

## Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```
NEON_DB_URL=your_neon_db_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
NEXT_PUBLIC_LOCAL_URL=http://localhost:3000
GOOGLE_APPLICATION_CREDENTIALS_JSON=your_google_credentials_json
```

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the production application
- `npm start`: Start the production server
- `npm run lint`: Run ESLint
- `npm test`: Run tests using Vitest

## Testing

The project uses Vitest for testing. To run the test suite, use the following command:

```
npm test
```

## Security Best Practices

- Authentication middleware is implemented using Clerk to protect specific routes.
- Sensitive information is stored as environment variables.
- API routes are protected to ensure only authenticated users can access sensitive data.
- Input validation and sanitization are implemented to prevent injection attacks.

## Performance Optimization

- State management with Zustand for efficient updates and rendering.
- Lazy loading of components and resources.
- Memoization of functions to prevent unnecessary re-renders.
- Conditional rendering to optimize DOM updates.
- Efficient API calls with proper error handling.

## AI Integration

The project leverages OpenAI's GPT-3.5-turbo model for generating interview questions and the text-to-speech model for audio playback of questions.

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct before submitting pull requests.

## License

[Add your chosen license here]
