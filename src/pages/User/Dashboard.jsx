import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, CheckCircle2, Trophy, Target } from 'lucide-react';

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active quizzes
        const quizQuery = query(
          collection(db, 'quizzes'),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
        const quizSnapshot = await getDocs(quizQuery);
        const fetchedQuizzes = quizSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuizzes(fetchedQuizzes);

        // Fetch user's past attempts
        if (user?.uid) {
          const attemptQuery = query(
            collection(db, 'attempts'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const attemptSnapshot = await getDocs(attemptQuery);
          const fetchedAttempts = attemptSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAttempts(fetchedAttempts);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Available Quizzes Section */}
      <section>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Available Quizzes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Select a quiz below to test your knowledge.</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No active quizzes found</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later when an admin has published new quizzes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                key={quiz.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
              >
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{quiz.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-indigo-500" /> {quiz.questions?.length} Questions</div>
                    <div className="flex items-center gap-1.5"><Clock size={16} className="text-orange-500" /> {quiz.timeLimit} Mins</div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-700">
                  <button 
                    onClick={() => navigate(`/attempt/${quiz.id}`)}
                    className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg font-medium transition-colors"
                  >
                    <PlayCircle size={18} /> Start Quiz
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Past Attempts Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy size={24} className="text-yellow-500" /> Your Past Attempts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review your historical performance.</p>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">You haven't taken any quizzes yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="p-4 font-semibold">Quiz Title</th>
                    <th className="p-4 font-semibold text-center">Score</th>
                    <th className="p-4 font-semibold text-center">Percentage</th>
                    <th className="p-4 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">
                        {attempt.quizTitle}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium text-sm">
                          <Target size={14} /> {attempt.score} / {attempt.totalQuestions}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`font-semibold ${attempt.percentage >= 70 ? 'text-green-600 dark:text-green-400' : attempt.percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                          {attempt.percentage}%
                        </span>
                      </td>
                      <td className="p-4 text-right text-sm text-gray-500 dark:text-gray-400">
                        {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
