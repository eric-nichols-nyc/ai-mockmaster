import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useInterviewStore from '@/store/interviewStore';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useApi } from '@/lib/api';

const formSchema = z.object({
  jobTitle: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  jobDescription: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

const InterviewForm: React.FC = () => {
  const router = useRouter();
  const { setInterview } = useInterviewStore();
  const { fetchApi } = useApi();

  const [jobTitle, setTitle] = useState('frontend dev');
  const [jobDescription, setDescription] = useState('frontend dev wanted with react experience');
  const [skillsInput, setSkillsInput] = useState('react, redux');
  const [interviewId, setInterviewId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    const skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
    const formData = { jobTitle, jobDescription, skills };

    try {
      // Validate form data
      const validatedData = formSchema.parse(formData);
   
      const data = await fetchApi('/openai/generate-questions', {
        method: 'POST',
        body: JSON.stringify(validatedData),
      });
      // check to make sure data.questions is an array
      if (Array.isArray(data.questions)) {
        // Create a new interview in the database
        const newInterview = await fetchApi('/interviews', {
          method: 'POST',
          body: JSON.stringify({ 
            ...validatedData,
            questions: data.questions
          }),
        });

        // Set the interview in the store
        setInterview(newInterview);
        setInterviewId(newInterview.id);

        // Set isSubmitted to true to show the Next button
        setIsSubmitted(true);
      } else if (data.error) {
        console.log('error', data.error);
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as { [key: string]: string });
        setFieldErrors(errors);
      } else if (err instanceof Error) {
        console.error('Error submitting form:', err);
        setError(`An error occurred while submitting the form: ${err.message}`);
      } else {
        setError('An unknown error occurred while submitting the form.');
      }
      console.error('Error submitting form:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    router.push(`/dashboard/interview/${interviewId}/start`);
  };

  return (
    <div className="space-y-4 w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Interview Title</label>
          <Input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            disabled={isSubmitted}
          />
          {fieldErrors.title && <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>}
        </div>
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">Description</label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            disabled={isSubmitted}
          />
          {fieldErrors.jobDescription && <p className="text-red-500 text-sm mt-1">{fieldErrors.jobDescription}</p>}
        </div>
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Required Skills (comma-separated)</label>
          <Input
            type="text"
            id="skills"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="mt-1"
            disabled={isSubmitted}
            placeholder="e.g. JavaScript, React, Node.js"
          />
          {fieldErrors.skills && <p className="text-red-500 text-sm mt-1">{fieldErrors.skills}</p>}
        </div>
        {!isSubmitted && (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating Interview...' : 'Generate Interview'}
          </Button>
        )}
      </form>
      
      {isSubmitted && (
        <Button onClick={handleNext} className="mt-4">
          Next
        </Button>
      )}
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default InterviewForm;