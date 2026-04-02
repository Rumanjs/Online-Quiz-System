import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowLeft, Trophy } from 'lucide-react';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const evaluation = location.state?.evaluation;
  const attemptData = location.state?.attemptData;

  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Result Found</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const getFeedback = (percentage) => {
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 70) return 'Good Job!';
    if (percentage >= 50) return 'Not Bad!';
    return 'Try Again!';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 mt-4">
      <div className="flex items-center">
        <button onClick={() => navigate('/')} className="mr-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Result</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center flex flex-col items-center justify-center">
          <Trophy className={`h-16 w-16 mb-4 ${evaluation.percentage >= 50 ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{getFeedback(evaluation.percentage)}</h2>
          <div className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 my-4">
            {evaluation.percentage}%
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            You scored {evaluation.score} out of {evaluation.totalQuestions}
          </p>
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            Time Taken: {Math.floor(attemptData.timeTaken / 60)}m {attemptData.timeTaken % 60}s
          </div>
        </motion.div>

        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Detailed Breakdown</h3>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {evaluation.results.map((res, i) => (
              <div key={i} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    {res.isCorrect ? <CheckCircle2 className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white mb-3">{res.questionText}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                        <span className="text-gray-500 dark:text-gray-400 block mb-1">Your Answer:</span>
                        <span className={`font-medium ${res.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {res.userAnswer}
                        </span>
                      </div>
                      {!res.isCorrect && (
                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-900/30 transition-colors">
                          <span className="text-green-600 dark:text-green-400/70 block mb-1 font-medium">Correct Answer:</span>
                          <span className="font-medium text-green-700 dark:text-green-300">
                            {res.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center mt-8">
        <Link to="/leaderboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2">
          <Trophy size={18} /> View Leaderboard
        </Link>
      </div>
    </div>
  );
}
