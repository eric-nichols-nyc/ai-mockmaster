import React from "react";
import Interview from "../../(components)/interview";

const InterviewStart = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-center text-purple-800 mb-8">Start Your Interview</h1>
        <p className="text-center text-lg mb-8 text-purple-600">
          Get ready to showcase your skills and experience. Take a deep breath, and let&rsquo;s begin!
        </p>
        <Interview />
      </div>
    </div>
  );
};

export default InterviewStart;
