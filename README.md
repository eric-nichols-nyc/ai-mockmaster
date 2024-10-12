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
- Dashboard with interview list and individual interview cards
- Animated components for enhanced user experience
- Detailed summary page for each interview question

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
- **Testing**: Vitest, React Testing Library, Playwright

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── (components)/
│   │       │   ├── Interview-card.tsx
│   │       │   └── InterviewList.tsx
│   │       ├── page.tsx
│   │       └── interview/
│   │           ├── (components)/
│   │           │   ├── interview.tsx
│   │           │   ├── interview-generation-form.tsx
│   │           │   ├── visualizer.tsx
│   │           │   ├── summary.tsx
│   │           │   └── AnimatedButton.tsx
│   │           ├── [id]/
│   │           │   ├── page.tsx
│   │           │   └── summary/
│   │           │       └── [qid]/
│   │           │           └── page.tsx
│   ├── _components/
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   └── stickyHeader.tsx
│   ├── api/
│   │   └── [[...route]]/
│   │       ├── route.ts
│   │       └── openai.ts
│   ├── globals.css
│   └── layout.tsx
├── db/
│   └── schema.ts
└── lib/
    └── api.ts
```

## How It Works

1. **Interview Initialization**: Users start a new interview or continue an existing one from the dashboard.
2. **Question Generation**: AI generates interview questions based on the job description using the interview-generation-form.
3. **Question Presentation**: The app presents questions one at a time in the interview component.
4. **Audio Playback**: Users can listen to the question using text-to-speech functionality.
5. **Answer Recording**: Users record their answers using the built-in audio recorder.
6. **Real-time Visualization**: The visualizer component provides real-time audio visualization during recording.
7. **Transcription**: After recording, the answer is transcribed using a speech-to-text service.
8. **Answer Processing**: The transcribed answer is saved and associated with the current question.
9. **Progress Tracking**: Users can move to the next question or finish the interview using the AnimatedButton component.
10. **Summary and Feedback**: Upon completion, users can view a summary of their interview performance, including AI-generated feedback and improvements, in the summary component.

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
- `npm test`: Run unit tests using Vitest
- `npm run test:e2e`: Run end-to-end tests using Playwright

## Testing

The project uses two main testing frameworks:

1. **Vitest** for unit and component testing
2. **Playwright** for end-to-end testing

### Running Unit Tests

To run the unit tests, use the following command:

```
npm test
```

This command will run all the tests in the `__tests__` directory using Vitest. You can also run tests in watch mode by adding the `--watch` flag:

```
npm test -- --watch
```

### Running End-to-End Tests

To run the end-to-end tests, use the following command:

```
npm run test:e2e
```

This command will run all the Playwright tests in the `e2e` directory. Make sure you have the development server running (`npm run dev`) in a separate terminal before running the e2e tests.

### Test Files Structure

- Unit and component tests are located in the `__tests__` directory
- End-to-end tests are located in the `e2e` directory

### Continuous Integration

The project is set up with GitHub Actions for continuous integration. The workflow runs both unit tests and end-to-end tests on every push and pull request to the main branch.

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

The project leverages OpenAI's GPT models for generating interview questions and providing AI-powered feedback. The OpenAI integration is handled through the `openai.ts` file in the API routes.

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct before submitting pull requests.

## License

[Add your chosen license here]

# ai-mockmaster
