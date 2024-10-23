import React, { useState, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Job } from "@/types"; // Importing Job type from types.ts
import MultipleSelector, { Option } from "@/components/ui/multi-select"; // Importing MultipleSelector
import { interviewFormSchema, InterviewFormData } from "@/lib/schemas"; // Adjust the import path
import { z } from "zod";

interface InterviewFormProps {
  onSubmit: (data: unknown) => void;
  jobs: Job[];
}

const InterviewForm: React.FC<InterviewFormProps> = ({ onSubmit, jobs }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState<Option[]>([]); // State for available skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]); // State for selected skills
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State for validation errors

  const handleJobChange = (selectedTitle: string) => {
    const selectedJob = jobs.find((job) => job.title === selectedTitle);
    if (selectedJob) {
      setJobTitle(selectedJob.title);
      setJobDescription(selectedJob.description);
      // Create an array of Option objects for skills
      const skillOptions: Option[] = selectedJob.skills.map((skill) => ({
        value: skill,
        label: skill,
      }));
      setSkills(skillOptions);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validate the form data
    const formData: InterviewFormData = {
      jobTitle,
      jobDescription,
      skills: selectedSkills,
    };

    try {
      interviewFormSchema.parse(formData); // Validate the data
      setErrors({}); // Clear previous errors
      onSubmit(formData); // Call the onSubmit function if validation passes
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message; // Map errors to field names
          return acc;
        }, {} as { [key: string]: string });
        setErrors(fieldErrors); // Set validation errors in state
      }
    }
  };

  const handleSelectedSkillsChange = useCallback(
    (newSelectedSkills: string[]) => {
      setSelectedSkills(newSelectedSkills);
    },
    []
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Interview Form
          </CardTitle>
          <CardDescription>Please fill out the details below.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <Label className="block text-lg font-bold text-blue-600 text-center">
              Select A Job Title
            </Label>
            <RadioGroup
              value={jobTitle}
              onValueChange={handleJobChange}
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
              onChange={(e) => setJobDescription(e.target.value)}
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
              onChange={handleSelectedSkillsChange} // Use the memoized callback
              placeholder="Select skills"
              options={skills} // Pass the skills array as options
            />
          </div>
          {errors.skills && <p className="text-red-500">{errors.skills}</p>}{" "}
          {/* Display error */}
          <button
            type="submit"
            className="mt-4 w-full bg-blue-500 text-white rounded-md p-3 hover:bg-blue-600 transition"
          >
            Submit
          </button>
        </form>
      </Card>
    </div>
  );
};

export default InterviewForm;
