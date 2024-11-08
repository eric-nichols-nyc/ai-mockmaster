import { useReducer, useCallback } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { generateTechInterviewQuestion } from '@/actions/gemini-actions';
import { InterviewFormData, InterviewFormSchema, InterviewJobSchema } from '@/lib/schemas';
import { interviewFormReducer, initialState } from '@/reducers/interview-form-reducer';
import { Job } from '@/types';
import { Option } from '@/components/ui/multi-select';

type UseInterviewFormProps = {
    onSubmit: (data: unknown) => void;
    interviewId: string | null;
    questionId: string | null;
    jobs: Job[];
}
// create a hook that will validate the interview form logic and data
export const useInterviewForm = ({ onSubmit, interviewId, questionId, jobs }: UseInterviewFormProps) => {
    // initialize the reducer with our initial state
    // state: containes teh form values and the UI states
    // dispatch: function to send actions to the reducer
    const [state, dispatch] = useReducer(interviewFormReducer, initialState);
    const router = useRouter(); // used for navigation after form submission
    // Handle when a job is selected from the list
    const handleJobChange = useCallback((selectedTitle: string) => {

        const selectedJob = jobs.find((job: Job) => job.title === selectedTitle);
        if (selectedJob) {
            dispatch({ type: 'SET_JOB', payload: selectedJob as Job });


            // Create skill options for the multi-select component
            const skillOptions: Option[] = selectedJob?.skills.map((skill: string) => ({
                value: skill,
                label: skill,
            })) || [];

            // Update available skills in the dropdown
            dispatch({ type: 'SET_AVAILABLE_SKILLS', payload: skillOptions });
            dispatch({ type: 'CLEAR_ERRORS' });
        }
    }, [jobs]);

    // handle when skeils are selected from the multi-select component
    const handleSkillsChange = useCallback((newSelectedSkills: string[]) => {
        dispatch({ type: 'SET_SKILLS', payload: newSelectedSkills });
    }, []);

    // function to handle the form validation for job title, description and skills
    const validateFormData = useCallback(() => {
        try {
            const formData: Omit<InterviewFormData, "questions"> = {
                jobTitle: state.jobTitle,
                jobDescription: state.jobDescription,
                skills: state.selectedSkills,
            };
            console.log("formData 2", formData);

            // First validation phase: Check if form data is valid
            const validationResult = InterviewJobSchema.safeParse(formData);
            console.log("validationResult", validationResult);

            if (!validationResult.success) {
                // If validation fails, format and display errors
                const fieldErrors = validationResult.error.errors.reduce(
                    (acc, curr) => {
                        acc[curr.path[0]] = curr.message;
                        return acc;
                    },
                    {} as { [key: string]: string }
                );

                dispatch({ type: 'SET_ERRORS', payload: fieldErrors });
                return false;
            }
            // Clear any existing errors if validation passed
            dispatch({ type: 'CLEAR_ERRORS' });
            return true;
        } catch (error) {
            console.error("Form validation error:", error);
        }
    }, [state.jobTitle, state.jobDescription, state.selectedSkills]);

    // Main form validation and submission function
    const validateFormSubmission = async () => {
        try {
            // Show loading state while processing
            dispatch({ type: 'SET_LOADING', payload: true });
            // Gather current form data from state
            const formData: Omit<InterviewFormData, "questions"> = {
                jobTitle: state.jobTitle,
                jobDescription: state.jobDescription,
                skills: state.selectedSkills,
            };
            // First validation phase: Check if form data is valid
            if (!validateFormData()) {
                return false;
            }
            // Generate an interview question using external service
            const question = await generateTechInterviewQuestion(
                formData.jobTitle,
                formData.jobDescription,
                formData.skills
            );


            if (!question) {
                throw new Error("Failed to generate interview question");
            }

            // Create final form data including generated question
            const finalFormData = {
                ...formData,
                questions: [{
                    question: question.question,
                    suggested: question.suggested,
                }],
            };

            // Final validation with complete data
            InterviewFormSchema.parse(finalFormData);

            // If we got here, everything is valid - submit the form
            onSubmit(finalFormData);
            dispatch({ type: 'SET_SUBMITTED', payload: true });
            return true;
        } catch (error) {
            // Handle different types of errors
            console.error("Form validation error:", error);
            if (error instanceof z.ZodError) {
                // Handle validation errors
                const fieldErrors = error.errors.reduce(
                    (acc, curr) => {
                        acc[curr.path[0]] = curr.message;
                        return acc;
                    },
                    {} as { [key: string]: string }
                );
                dispatch({ type: 'SET_ERRORS', payload: fieldErrors });
            } else if (error instanceof Error) {
                // Handle general errors
                dispatch({
                    type: 'SET_ERRORS',
                    payload: { form: error.message }
                });
            }
            return false;
        } finally {
            // Reset loading state after processing
            dispatch({ type: 'SET_LOADING', payload: false });
        };
    };
    // Handle navigation to the interview page
    const handleStartInterview = useCallback(() => {
        if (interviewId && questionId) {
            const url = `/interview/${interviewId}/start/${questionId}`;
            console.log("url", url);
            router.push(url);
        } else {
            toast.error("Interview ID or Question ID not found");
        }
    }, [interviewId, questionId, router]);

    // Function to reset the form to its initial state
    const resetForm = useCallback(() => {
        dispatch({ type: 'RESET_FORM' });
    }, []);

    // Return everything the component needs
    return {
        formState: state,                      // Current form state
        handleJobChange,            // Function to handle job selection
        handleSkillsChange, // Function to handle skill selection
        validateFormSubmission,               // Function to validate and submit form
        handleStartInterview,       // Function to start the interview
        resetForm,                  // Function to reset the form
    };

};
