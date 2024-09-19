import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useInterviewStore from '@/store/interviewStore';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less'),
  skills: z.string().min(1, 'Skills are required').max(200, 'Skills must be 200 characters or less'),
});

const InterviewForm: React.FC = () => {
  const router = useRouter();
  const { question, answer, setQuestionAndAnswer } = useInterviewStore();

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [skills, setSkills] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    const formData = { title, description, skills };

    try {
      // Validate form data
      const validatedData = formSchema.parse(formData);
   
      const response = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_URL}/api/question/getquestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Generate an interview question and answer in JSON schema: {"question": string, "answer":string}, based on the following:
            Title: ${validatedData.title}
            Description: ${validatedData.description}
            Skills: ${validatedData.skills}
            `
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const MockJsonResp = data.response
        .replace("```json", "")
        .replace("```", "")
        .trim();
      console.log(JSON.parse(MockJsonResp));
      if (data.response) {
        // Parse the MockJsonResp and set the question and answer in the store
        const { question, answer } = JSON.parse(MockJsonResp);
        setQuestionAndAnswer(question, answer);
        
        // Redirect to the dashboard/start page
        router.push('/dashboard/interview/start');
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response from server');
      }

      // Reset form fields
      setTitle('');
      setDescription('');
      setSkills('');
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as { [key: string]: string });
        setFieldErrors(errors);
      } else if (err instanceof Error) {
        setError(`An error occurred while submitting the form: ${err.message}`);
      } else {
        setError('An unknown error occurred while submitting the form.');
      }
      console.error('Error submitting form:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
        {fieldErrors.title && <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
        />
        {fieldErrors.description && <p className="text-red-500 text-sm mt-1">{fieldErrors.description}</p>}
      </div>
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
        <Input
          type="text"
          id="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="mt-1"
          placeholder="Separate skills with commas"
        />
        {fieldErrors.skills && <p className="text-red-500 text-sm mt-1">{fieldErrors.skills}</p>}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating Question...' : 'Generate Question'}
      </Button>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
      
      {question && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Generated Question:</h3>
          <p className="mt-2">{question}</p>
          <h4 className="text-md font-medium mt-4">Answer:</h4>
          <p className="mt-2">{answer}</p>
        </div>
      )}
    </form>
  );
};

export default InterviewForm;