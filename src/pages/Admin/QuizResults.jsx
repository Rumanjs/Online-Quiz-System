import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ArrowLeft, Users, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuizResults() {
  const { quizId } = useParams();
  const [quizName, setQuizName] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch quiz title
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (quizDoc.exists()) {
          setQuizName(quizDoc.data().title);
        }

        // Fetch attempts for this quiz
        const q = query(
          collection(db, 'attempts'),
          where('quizId', '==', quizId),
          orderBy('score', 'desc'),
          orderBy('timeTaken', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedAttempts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAttempts(fetchedAttempts);
      } catch (error) {
        console.error("Error fetching quiz results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const averageScore = attempts.length > 0
    ? (attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center mb-8">
        <Link to="/admin" className="mr-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Results</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{quizName || 'Loading...'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Attempts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{attempts.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Average Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageScore}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-semibold text-gray-900 dark:text-white">Participant Rankings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                <th className="p-4 font-semibold">Rank</th>
                <th className="p-4 font-semibold">Participant Name</th>
                <th className="p-4 font-semibold text-center">Score</th>
                <th className="p-4 font-semibold text-center">Percentage</th>
                <th className="p-4 font-semibold text-right">Time Taken</th>
                <th className="p-4 font-semibold text-right">Date Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No participants have attempted this quiz yet.
                  </td>
                </tr>
              ) : (
                attempts.map((attempt, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={attempt.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' : index === 1 ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' : 'text-gray-500 font-medium'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {attempt.userName}
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium text-sm">
                        {attempt.score} / {attempt.totalQuestions}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-semibold ${attempt.percentage >= 70 ? 'text-green-600 dark:text-green-400' : attempt.percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                        {attempt.percentage}%
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-600 dark:text-gray-400 font-mono text-sm">
                      <div className="flex justify-end items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" /> 
                        <span>{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-sm text-gray-500 dark:text-gray-400">
                      {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
