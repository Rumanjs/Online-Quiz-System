import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { useQuizStore } from '../../store/quizStore';
import { evaluateQuiz } from '../../utils/evaluation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentQuiz, startQuiz, setAnswer, answers, timeRemaining, decrementTime, submitQuiz, clearQuiz } = useQuizStore();
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          startQuiz({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert('Quiz not found');
          navigate('/');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();

    return () => clearQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  useEffect(() => {
    if (!currentQuiz) return;
    
    const timer = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuiz]);

  useEffect(() => {
    if (currentQuiz && timeRemaining <= 0) {
      handleFinalSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, currentQuiz]);

  const handleFinalSubmit = async () => {
    submitQuiz();
    const evaluation = evaluateQuiz(currentQuiz, answers);
    
    try {
      const attemptData = {
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        userId: user.uid,
        userName: user.displayName || user.email,
        score: evaluation.score,
        totalQuestions: evaluation.totalQuestions,
        percentage: evaluation.percentage,
        timeTaken: (currentQuiz.timeLimit * 60) - timeRemaining,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'attempts'), attemptData);
      
      await addDoc(collection(db, 'leaderboard'), {
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        userId: user.uid,
        userName: attemptData.userName,
        score: attemptData.score,
        timeTaken: attemptData.timeTaken,
        createdAt: attemptData.createdAt
      });

      clearQuiz();
      navigate(`/result/${docRef.id}`, { state: { evaluation, attemptData } });
    } catch (error) {
      console.error("Failed to submit", error);
    }
  };

  useEffect(() => {
    const preventAction = (_e) => {
        // _e.preventDefault();
        // Disabling strict prevention for demo. Un-comment to actually block right click
    };
    document.addEventListener('contextmenu', preventAction);
    document.addEventListener('copy', preventAction);
    document.addEventListener('paste', preventAction);
    
    return () => {
      document.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('paste', preventAction);
    };
  }, []);

  if (loading || !currentQuiz) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  const question = currentQuiz.questions[currentIndex];
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto mt-4 pb-12">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 flex justify-between items-center sticky top-4 z-10 transition-colors">
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white line-clamp-1">{currentQuiz.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Question {currentIndex + 1} of {currentQuiz.questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${timeRemaining < 60 ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 animate-pulse' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
          <Clock size={20} /> {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r flex items-start gap-3">
        <AlertCircle className="text-amber-500 mt-0.5" size={20} />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Anti-Cheating Enabled</p>
          <p>Copying, pasting, and right-clicking may be disabled during the quiz to preserve integrity.</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8 overflow-hidden">
        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / currentQuiz.questions.length) * 100}%` }}></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8 mb-8"
        >
          <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-8">{question.text}</h2>

          {question.type === 'mcq' ? (
            <div className="space-y-4">
              {question.options.map((opt, i) => (
                <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[question.id] == i ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'}`}>
                  <input type="radio" name={question.id} value={i} checked={answers[question.id] == i} onChange={(e) => setAnswer(question.id, e.target.value)} className="w-5 h-5 text-indigo-600" />
                  <span className="text-lg text-gray-700 dark:text-gray-200">{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Answer</label>
              <textarea rows="4" value={answers[question.id] || ''} onChange={(e) => setAnswer(question.id, e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="Type your answer here..." />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)} className="px-6 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
          Previous
        </button>

        {currentIndex === currentQuiz.questions.length - 1 ? (
          <button onClick={handleFinalSubmit} className="px-8 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg">
            Submit Quiz
          </button>
        ) : (
          <button onClick={() => setCurrentIndex(currentIndex + 1)} className="px-8 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg">
            Next
          </button>
        )}
      </div>
    </div>
  );
}
