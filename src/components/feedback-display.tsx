import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ErrorBoundary from '@/components/error-boundary';

interface KeyPoint {
    point: string;
    explanation: string;
}

interface ToneAnalysis {
    overall_tone: string;
    professionalism: number;
    confidence: number;
    clarity: number;
}

interface FeedbackResponse {
    suggested_answer: string;
    answer_feedback: string;
    constructive_feedback: {
        strengths: string[];
        areas_for_improvement: string[];
        actionable_tips: string[];
    };
    key_points: KeyPoint[];
    tone_analysis: ToneAnalysis;
    grade: {
        score: number;
        explanation: string;
    };
}

interface FeedbackDisplayProps {
    feedback: FeedbackResponse;
}

export default function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
    return (
        <ErrorBoundary>
            <div className="space-y-6 max-w-4xl mx-auto p-4">
                {/* Overall Grade */}
                <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Overall Grade</span>
                            <span className="text-4xl font-bold text-primary underline decoration-2">
                                {feedback.grade.score}%
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{feedback.grade.explanation}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="whitespace-pre-line text-gray-700">
                            {feedback.answer_feedback}
                        </div>
                    </CardContent>
                </Card>

                {/* Suggested Answer */}
                <Card>
                    <CardHeader>
                        <CardTitle>A strong answer would be: </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="whitespace-pre-line text-gray-700">
                            {feedback.suggested_answer}
                        </div>
                    </CardContent>
                </Card>

                {/* Tone Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle>Response Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="font-medium">Overall Tone: {feedback.tone_analysis.overall_tone}</p>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span>Professionalism</span>
                                        <span>{feedback.tone_analysis.professionalism}%</span>
                                    </div>
                                    <Progress value={feedback.tone_analysis.professionalism} />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span>Confidence</span>
                                        <span>{feedback.tone_analysis.confidence}%</span>
                                    </div>
                                    <Progress value={feedback.tone_analysis.confidence} />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span>Clarity</span>
                                        <span>{feedback.tone_analysis.clarity}%</span>
                                    </div>
                                    <Progress value={feedback.tone_analysis.clarity} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Constructive Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-4 space-y-2">
                                {feedback.constructive_feedback.strengths.map((strength, index) => (
                                    <li key={index} className="text-gray-700">{strength}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Areas for Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-4 space-y-2">
                                {feedback.constructive_feedback.areas_for_improvement.map((area, index) => (
                                    <li key={index} className="text-gray-700">{area}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Actionable Tips */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actionable Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-decimal pl-4 space-y-2">
                            {feedback.constructive_feedback.actionable_tips.map((tip, index) => (
                                <li key={index} className="text-gray-700">{tip}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Key Points */}
                {feedback.key_points && feedback.key_points.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Key Points</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {feedback.key_points.map((point, index) => (
                                    <div key={index} className="space-y-2">
                                        <h4 className="font-medium">{point.point}</h4>
                                        <p className="text-gray-700">{point.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ErrorBoundary>
    );
}
