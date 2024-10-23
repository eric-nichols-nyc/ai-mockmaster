import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateInterviewSchema } from '@/lib/schemas';

const InterviewForm: React.FC<{ onSubmit: (data: unknown) => void }> = ({ onSubmit }) => {
  const [questions, setQuestions] = useState([{ question: '', suggested: '' }]);

  const form = useForm({
    resolver: zodResolver(CreateInterviewSchema),
    defaultValues: {
      jobTitle: '',
      jobDescription: '',
      skills: [],
      questions: questions,
    },
  });

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', suggested: '' }]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const updatedQuestions = questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };

  const onSubmitForm = (data: { jobTitle: string; jobDescription: string; skills: string[] }) => {
    onSubmit({ ...data, questions });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
        <input
          id="jobTitle"
          {...form.register('jobTitle')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {form.formState.errors.jobTitle && <p className="text-red-500">{form.formState.errors.jobTitle.message}</p>}
      </div>

      <div>
        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">Job Description</label>
        <textarea
          id="jobDescription"
          {...form.register('jobDescription')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
        <input
          id="skills"
          {...form.register('skills')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Comma separated skills"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium">Questions</h3>
        {questions.map((q, index) => (
          <div key={index} className="flex space-x-2">
            <input
              type="text"
              placeholder="Question"
              value={q.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <input
              type="text"
              placeholder="Suggested Answer"
              value={q.suggested}
              onChange={(e) => handleQuestionChange(index, 'suggested', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <button type="button" onClick={() => handleRemoveQuestion(index)} className="text-red-500">Remove</button>
          </div>
        ))}
        <button type="button" onClick={handleAddQuestion} className="mt-2 text-blue-500">Add Question</button>
      </div>

      <button type="submit" className="mt-4 bg-blue-500 text-white rounded-md p-2">Submit</button>
    </form>
  );
};

export default InterviewForm;
