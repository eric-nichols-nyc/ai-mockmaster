import { useInterview } from "@/hooks/use-tanstack-interview";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, MessageSquare, ThumbsUp, AlertCircle, Award } from "lucide-react";

const InterviewResults = ({ interviewId }: { interviewId: string }) => {
  const { interview } = useInterview(interviewId);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getGradeColor = (grade: string | null | undefined) => {
    if (!grade) return "text-gray-500";
    if (grade === 'A' || grade === 'B') return "text-green-500";
    if (grade == 'C') return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Overview Card */}
      <motion.div variants={item}>
        <Card className="shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-t-4 border-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Interview Summary</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-primary/10">
                    <Clock className="w-4 h-4 mr-1" />
                    45s
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/10">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    100 words
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">Overall Grade <Award className={`w-6 h-6 mt-1 ${getGradeColor(interview?.questions[0].grade)}`} />
                </div>
                <div className={`text-4xl font-bold ${getGradeColor(interview?.questions[0].grade)}`}>
                  {interview?.questions[0].grade}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Transcription Card */}
      <motion.div variants={item}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Response</CardTitle>
            <CardDescription>Transcribed answer to the question</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {interview?.questions[0].answer}
            </p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={item}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {interview?.questions[0].feedback}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Suggested Response Card */}
      <motion.div variants={item}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Suggested Response</CardTitle>
            <CardDescription>An example of a strong answer</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {interview?.questions[0].suggested}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback Card */}
      <motion.div variants={item}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
            <CardDescription>Analysis of your response</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Strengths */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold flex items-center mb-2">
                <ThumbsUp className="w-4 h-4 mr-2 text-green-500" />
                Strengths
              </h3>
              <ul className="list-disc pl-6 space-y-1">
                {interview?.questions[0].improvements?.map((strength, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <h3 className="font-semibold flex items-center mb-2">
                <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                Areas for Improvement
              </h3>
              <ul className="list-disc pl-6 space-y-1">
                {interview?.questions[0].keyTakeaways?.map((improvement, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default InterviewResults;