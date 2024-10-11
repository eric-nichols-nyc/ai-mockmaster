import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useApi } from '@/lib/api';
import AnimatedButton from './AnimatedButton';

const formSchema = z.object({
  jobTitle: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  jobDescription: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

const InterviewForm: React.FC = () => {
  const router = useRouter();
  const { fetchApi } = useApi();

  const [jobTitle, setTitle] = useState('');
  const [jobDescription, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [interviewId, setInterviewId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitted) {
      handleNext();
      return;
    }
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    const skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
    const formData = { jobTitle, jobDescription, skills };

    try {
      const validatedData = formSchema.parse(formData);
   
      const data = await fetchApi('/openai/generate-questions', {
        method: 'POST',
        body: JSON.stringify(validatedData),
      });

      if (Array.isArray(data.questions)) {
        const newInterview = await fetchApi('/interviews', {
          method: 'POST',
          body: JSON.stringify({ 
            ...validatedData,
            questions: data.questions
          }),
        });
        setInterviewId(newInterview.id);
        setIsSubmitted(true);
      } else if (data.error) {
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
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl mx-auto transition-all duration-300 ease-in-out hover:shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Generate Interview</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Interview Title <span className="text-red-500">*</span></label>
          <Input
            data-testid="jobTitle"
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitted}
            required
          />
          {fieldErrors.jobTitle && <p className="text-red-500 text-sm mt-1">{fieldErrors.jobTitle}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">Description (optional)</label>
          <Textarea
            data-testid="jobDescription"
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitted}
            rows={4}
            placeholder="Enter a brief description of the job or interview context..."
          />
          {fieldErrors.jobDescription && <p className="text-red-500 text-sm mt-1">{fieldErrors.jobDescription}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Required Skills (optional, comma-separated)</label>
          <Input
            type="text"
            id="skills"
            data-testid="skills"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-full transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitted}
            placeholder="e.g. JavaScript, React, Node.js"
          />
          {fieldErrors.skills && <p className="text-red-500 text-sm mt-1">{fieldErrors.skills}</p>}
        </div>
        <div className="flex justify-center">
          <AnimatedButton
            onClick={handleSubmit}
            isLoading={isLoading}
            isSubmitted={isSubmitted}
          />
        </div>
      </form>
      
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
};

export default InterviewForm;
