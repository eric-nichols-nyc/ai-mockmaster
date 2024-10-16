'use client'

import { useState, useEffect, useRef } from 'react'
import { useCompletion } from 'ai/react'

interface ParsedCompletion {
  questionAddressed: string;
  skillsDemonstrated: string;
  strengths: string;
  areasForImprovement: string;
  overallScore: string;
}

const defaultValues = {
  title: "JavaScript Developer Interview",
  question: "Explain the concept of closures in JavaScript and provide an example of how they can be useful.",
  answer: "Closures in JavaScript occur when a function is defined within another function, allowing the inner function to access variables from the outer function's scope. This creates a 'closure' around those variables, preserving them even after the outer function has finished executing. Closures are useful for data privacy, creating function factories, and implementing module patterns. For example, you can use closures to create private variables in JavaScript:\n\nfunction createCounter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\n\nconst counter = createCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n\nIn this example, the inner function has access to the 'count' variable, which remains private and can't be accessed directly from outside the function.",
  skills: ["JavaScript", "Functional Programming", "Scope", "Data Privacy"]
}

export default function SkillAssessment() {
  const [isStreaming, setIsStreaming] = useState(true)
  const { completion, isLoading, complete } = useCompletion({
    api: '/api/stream',
  })

  const [title, setTitle] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [parsedCompletion, setParsedCompletion] = useState<ParsedCompletion | null>(null)
  const streamedCompletion = useRef('')

  const handleAddSkill = () => {
    if (newSkill.trim() !== '') {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !question || !answer || skills.length === 0) {
      alert('Please fill in all required fields and add at least one skill.')
      return
    }
    const formData = {
      title,
      question,
      answer,
      skills: skills.join(', '),
      streaming: isStreaming
    }
    console.log('Sending data:', JSON.stringify(formData, null, 2))
    streamedCompletion.current = '' // Reset streamed completion
    if (isStreaming) {
      try {
        const result = await complete(JSON.stringify(formData))
        console.log('Streaming result:', result)
      } catch (error: unknown) {
        console.error('Error in streaming request:', error)
        alert(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`)
      }
    } else {
      try {
        const response = await fetch('/api/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        const result = await response.json()
        console.log('Non-streaming result:', result)
        if (result.error) {
          alert(`Error: ${result.error}`)
          return
        }
        setParsedCompletion(result)
      } catch (error: unknown) {
        console.error('Error in non-streaming request:', error)
        alert(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`)
      }
    }
  }

  const populateDefaultValues = () => {
    setTitle(defaultValues.title)
    setQuestion(defaultValues.question)
    setAnswer(defaultValues.answer)
    setSkills(defaultValues.skills)
  }

  // Parse the completion when it changes (for streaming responses)
  useEffect(() => {
    if (completion && isStreaming) {
      streamedCompletion.current += completion
      try {
        const parsed = JSON.parse(streamedCompletion.current) as ParsedCompletion
        setParsedCompletion(parsed)
      } catch (error) {
        // If it's not valid JSON yet, we'll wait for more data
        console.log('Accumulated streaming data:', streamedCompletion.current)
      }
    }
  }, [completion, isStreaming])

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Skill Assessment</h1>
      <button
        onClick={populateDefaultValues}
        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Populate with Default Values
      </button>
      <form onSubmit={handleCustomSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700">Question</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            required
          />
        </div>
        <div>
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700">Answer</label>
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            required
          />
        </div>
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="skills"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="mt-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="streaming"
            checked={isStreaming}
            onChange={(e) => setIsStreaming(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="streaming" className="text-sm font-medium text-gray-700">Use streaming response</label>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Assessing...' : 'Assess Skills'}
        </button>
      </form>
      {parsedCompletion && (
        <div className="p-4 bg-gray-100 rounded-md space-y-4">
          <h2 className="text-xl font-semibold">Assessment Results</h2>
          <div>
            <h3 className="font-semibold">Question Addressed:</h3>
            <p>{parsedCompletion.questionAddressed}</p>
          </div>
          <div>
            <h3 className="font-semibold">Skills Demonstrated:</h3>
            <p>{parsedCompletion.skillsDemonstrated}</p>
          </div>
          <div>
            <h3 className="font-semibold">Strengths:</h3>
            <p>{parsedCompletion.strengths}</p>
          </div>
          <div>
            <h3 className="font-semibold">Areas for Improvement:</h3>
            <p>{parsedCompletion.areasForImprovement}</p>
          </div>
          <div>
            <h3 className="font-semibold">Overall Score:</h3>
            <p>{parsedCompletion.overallScore}</p>
          </div>
        </div>
      )}
    </div>
  )
}
