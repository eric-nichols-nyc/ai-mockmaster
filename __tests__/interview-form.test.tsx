import { render, screen, fireEvent,waitFor } from "@testing-library/react";
import InterviewForm from "../src/components/interview-form";
import { vi } from "vitest";

const mockJobs = [
    {
      title: "Software Engineer",
      description: "Develop software solutions.",
      skills: ["JavaScript", "React"],
    },
    {
      title: "Product Manager",
      description: "Manage product development.",
      skills: ["Agile", "Communication"],
    },
  ];
const mockSubmit = vi.fn(); // Use vi.fn() for Vitest

describe("InterviewForm", () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(() => {
    mockSubmit.mockClear(); // Clear previous calls to the mock function
  });
  

  const mockOnSubmit = vi.fn(); // Mock function for onSubmit

  beforeEach(() => {
    render(<InterviewForm onSubmit={mockOnSubmit} jobs={mockJobs} />);
    screen.debug(); // Debugging line to see the rendered output
  });

  it("renders the form with job titles", () => {
    expect(screen.getByText(/Select A Job Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByLabelText('Product Manager')).toBeInTheDocument();
  });

    it('updates job description when a job is selected', async() => {
      const jobRadio = screen.getByLabelText('Software Engineer');
      fireEvent.click(jobRadio);

        // Wait for the textarea to have the expected value
        await waitFor(() => {
            expect(screen.getByRole('textbox', { name: /job description/i })).toHaveValue('Develop software solutions.');
        });    });

  //   it('submits the form with selected values', () => {
  //     const jobRadio = screen.getByLabelText('Software Engineer');
  //     fireEvent.click(jobRadio);

  //     const skillsSelector = screen.getByPlaceholderText('Select skills');
  //     fireEvent.change(skillsSelector, { target: { value: 'JavaScript' } });

  //     const descriptionTextarea = screen.getByRole('textbox', { name: /job description/i });
  //     fireEvent.change(descriptionTextarea, { target: { value: 'This is a test job description.' } });

  //     const submitButton = screen.getByRole('button', { name: /submit/i });
  //     fireEvent.click(submitButton);

  //     expect(mockOnSubmit).toHaveBeenCalledWith({
  //       jobTitle: 'Software Engineer',
  //       jobDescription: 'This is a test job description.',
  //       skills: ['JavaScript'],
  //     });
  //   });
});
