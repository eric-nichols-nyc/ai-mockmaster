import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Job } from "@/types"; // Importing Job type from types.ts
import MultipleSelector from "@/components/ui/multi-select"; // Importing MultipleSelector
//import { InterviewFormSchema, InterviewFormData } from "@/lib/schemas"; // Adjust the import path
//import { z } from "zod";
import { StatefulButton } from "@/components/stateful-button";
import useButtonState from "@/hooks/use-button-state";
//import { generateTechInterviewQuestion } from "@/actions/gemini-actions";
import { Button } from "@/components/ui/button"; // Add this import if not already present
//import { useRouter } from "next/navigation";
//import { toast } from "sonner";
import { ArrowRight } from "lucide-react"; // Add this import at the top
import { useInterviewForm } from "@/hooks/use-interviewform";

interface InterviewFormProps {
  onSubmit: (data: unknown) => void;
  jobs: Job[];
  interviewId: string | null;
  questionId: string | null;
}

// type Question = {
//   question: string;
//   suggested: string;
// };

const InterviewForm: React.FC<InterviewFormProps> = ({
  onSubmit,
  jobs,
  interviewId,
  questionId,
}) => {
  // const router = useRouter();
  //const [jobTitle, setJobTitle] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  //const [jobDescription, setJobDescription] = useState("");
  //const [skills, setSkills] = useState<Option[]>([]); // State for available skills
  //const [selectedSkills, setSelectedSkills] = useState<string[]>([]); // State for selected skills
  //const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State for validation errors

  const { formState, handleJobChange, handleStartInterview, handleSkillsChange,resetForm, validateFormSubmission } = useInterviewForm({onSubmit, interviewId, questionId, jobs});
  const {jobDescription, errors, jobTitle, availableSkills} = formState;

  // const handleJobChange = (selectedTitle: string) => {
  //   const selectedJob = jobs.find((job) => job.title === selectedTitle);
  //   if (selectedJob) {
  //     setJobTitle(selectedJob.title);
  //     setJobDescription(selectedJob.description);
  //     // Create an array of Option objects for skills
  //     const skillOptions: Option[] = selectedJob.skills.map((skill) => ({
  //       value: skill,
  //       label: skill,
  //     }));
  //     setSkills(skillOptions);
  //   }
  // };

  const { state, setState, handleButtonSubmit, getButtonText } = useButtonState({
    initialState: "idle",
    onSuccess: () => {
      console.log("Form submitted successfully");
      resetForm();
      setIsSubmitted(true);
    },
    onError: () => {
      console.error("Form submission failed");
    },
  });

  // const handleSelectedSkillsChange = useCallback(
  //   (newSelectedSkills: string[]) => {
  //     setSelectedSkills(newSelectedSkills);
  //   },
  //   []
  // );

  const onJobChange = (jobTitle: string) => {
    console.log("jobTitle", jobTitle);
    handleJobChange(jobTitle);
    setState('idle');
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const test = await handleButtonSubmit(validateFormSubmission);
    console.log("test", test);
  };

  // const handleStartInterview = () => {
  //   if (interviewId && questionId) {
  //     const url = `/interview/${interviewId}/start?questionId=${questionId}`;
  //     console.log("url", url);
  //     router.push(url);
  //   } else {
  //     toast.error("Interview ID or Question ID not found");
  //   }
  // };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title" className="text-lg font-semibold">
            Interview Form
          </CardTitle>
          <CardDescription data-testid="card-description">
            Please fill out the details below.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <Label className="block text-lg font-bold text-blue-600 text-center">
              Select A Job Title
            </Label>
            <RadioGroup
              value={jobTitle}
              onValueChange={onJobChange}
              className="flex flex-wrap justify-center space-x-2"
            >
              {jobs.length > 0 &&
                jobs.map((job, index) => (
                  <div key={index} className="flex items-center">
                    <RadioGroupItem
                      value={job.title}
                      id={`job-${index}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`job-${index}`}
                      className="flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-full cursor-pointer bg-white text-black shadow-md hover:bg-gray-100 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                    >
                      {job.title}
                    </Label>
                  </div>
                ))}
            </RadioGroup>
          </div>
          {errors.jobTitle && <p className="text-red-500">{errors.jobTitle}</p>}{" "}
          {/* Display error */}
          <div>
            <Label
              htmlFor="jobDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Job Description
            </Label>
            <textarea
              name="job description"
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => console.log(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 h-32"
              placeholder="Enter job description here..."
            />
          </div>
          {errors.jobDescription && (
            <p className="text-red-500">{errors.jobDescription}</p>
          )}{" "}
          {/* Display error */}
          <div>
            <Label
              htmlFor="skills"
              className="block text-sm font-medium text-gray-700"
            >
              Skills
            </Label>
            <MultipleSelector
              onChange={handleSkillsChange} // Use the memoized callback
              placeholder="Select skills"
              options={availableSkills} // Pass the skills array as options
            />
          </div>
          {errors.skills && <p className="text-red-500">{errors.skills}</p>}{" "}
          <div className="flex justify-end space-x-4">
            {!isSubmitted ? (
              <StatefulButton
                type="submit"
                state={state}
                className="mt-4 w-full"
              >
                {getButtonText()}
              </StatefulButton>
            ) : (
              <Button
                onClick={handleStartInterview}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Interview <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InterviewForm;
