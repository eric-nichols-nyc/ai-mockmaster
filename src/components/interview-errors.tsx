import React from "react";

type InterviewErrorsProps = {
  errorMessage: string | null;
};
export const InterviewErrors = ({ errorMessage }: InterviewErrorsProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-2xl card-shadow">
        <p className="text-red-500 text-center font-semibold">{errorMessage}</p>
      </div>
    </div>
  );
};
