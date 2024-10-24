'use client';
import React, { useState, useEffect } from 'react';
//import { GetResultsSchema } from '@/lib/schemas';

// Define the type for feedback items
type FeedbackItem = {
    suggested_answer: string;
    constructive_feedback: {
        strengths: string[];
        areas_for_improvement: string[];
        actionable_tips: string[];
    };
    tone_analysis: {
        overall_tone: string;
    };
    grade: {
        score: number;
        explanation: string;
    };
};

const data = {
    question: "What is your experience with React?",
    answer: "I have been working with React for 3 years, building various applications.",
    position: "Frontend Developer",
    skills: ["JavaScript", "React", "CSS"]
};


function FeedbackStreamComponent() {
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);

    useEffect(() => {
        const fetchFeedbackStream = async () => {
            try {
                const response = await fetch('/api/openai/get-feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder('utf-8');
                let done = false;

                while (!done) {
                    const result = await reader?.read();
                    if (result) {
                        const { value, done: streamDone } = result;
                        done = streamDone;
                        if (value) {
                            const text = decoder.decode(value, { stream: true });
                            console.log('Feedback:', text);
                            setFeedback(prevFeedback => [...prevFeedback, JSON.parse(text)]);
                        }
                    }
                }

            } catch (error) {
                console.error('Error fetching feedback stream:', error);
            }
        };

        fetchFeedbackStream();
    }, []);

    return (
        <div>
            <h1>Feedback Stream</h1>
            <ul>
                {feedback.map((item, index) => (
                    <li key={index}>
                        <strong>Suggested Answer:</strong> {item.suggested_answer}<br />
                        <strong>Strengths:</strong> {item.constructive_feedback.strengths.join(', ')}<br />
                        <strong>Areas for Improvement:</strong> {item.constructive_feedback.areas_for_improvement.join(', ')}<br />
                        <strong>Actionable Tips:</strong> {item.constructive_feedback.actionable_tips.join(', ')}<br />
                        <strong>Overall Tone:</strong> {item.tone_analysis.overall_tone}<br />
                        <strong>Score:</strong> {item.grade.score} - {item.grade.explanation}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FeedbackStreamComponent;
