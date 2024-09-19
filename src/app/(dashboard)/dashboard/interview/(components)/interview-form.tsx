import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useInterviewStore from '@/store/interviewStore';
import  {useRouter} from 'next/navigation';
interface InterviewFormProps {
  onSubmit: (formData: { title: string; description: string; skills: string }) => void;
}

const InterviewForm: React.FC<InterviewFormProps> = ({ onSubmit }) => {
  const router = useRouter();
  const { question, answer, setQuestionAndAnswer } = useInterviewStore();

  const [title, setTitle] = React.useState('frontend developer');
  const [description, setDescription] = React.useState('Performs hands-on architecture, design, and development of systems');
  const [skills, setSkills] = React.useState('react, redux');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = { title, description, skills };
    onSubmit(formData);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_URL}/api/question/getquestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Generate an interview question and answer in JSON schema: {"question": string, "answer":string}, based on the following:
            Title: ${title}
            Description: ${description}
            Skills: ${skills}
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
        // You can uncomment the following line if you want to enable redirection
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
      if (err instanceof Error) {
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
          required
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
        <Input
          type="text"
          id="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          required
          className="mt-1"
          placeholder="Separate skills with commas"
        />
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