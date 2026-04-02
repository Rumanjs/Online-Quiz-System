import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function EditQuiz() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { quizId } = useParams();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().createdBy === user.uid) {
          const data = docSnap.data();
          setTitle(data.title);
          setDescription(data.description);
          setTimeLimit(data.timeLimit);
          setQuestions(data.questions);
        } else {
          alert('Quiz not found or you do not have permission.');
          navigate('/admin');
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, user.uid, navigate]);

  const addQuestion = (type) => {
    const newQuestion = type === 'mcq' 
      ? { id: Date.now().toString(), type: 'mcq', text: '', options: ['', '', '', ''], correctOptionIndex: 0 }
      : { id: Date.now().toString(), type: 'short_answer', text: '', keywords: '' };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) return alert('Please add at least one question.');
    
    for (let q of questions) {
      if (!q.text.trim()) return alert('All questions must have text.');
      if (q.type === 'mcq') {
        if (q.options.some(opt => !opt.trim())) return alert('All MCQ options must be filled.');
      } else {
        if (!q.keywords.trim()) return alert('Short answer questions must have expected keywords for evaluation.');
      }
    }

    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'quizzes', quizId);
      await updateDoc(docRef, {
        title,
        description,
        timeLimit: Number(timeLimit),
        questions,
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 2000);
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Failed to update quiz. Try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Updated!</h2>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/admin')} className="mr-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Quiz</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quiz Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. React Fundamentals" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows="2" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="Brief description of the quiz..." />
          </div>
          <div className="w-1/3 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (Minutes)</label>
            <input required type="number" min="1" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Questions</h2>
          </div>
          
          <AnimatePresence>
            {questions.map((q, index) => (
              <motion.div key={q.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative">
                <div className="absolute top-4 right-4">
                  <button type="button" onClick={() => removeQuestion(q.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Remove Question">
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="mb-4 pr-10">
                  <span className="inline-block bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs font-semibold px-2 py-1 rounded mb-2">
                    Question {index + 1}
                  </span>
                  <input required type="text" value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 text-lg font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="Type your question here..." />
                </div>

                {q.type === 'mcq' ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Options (Select the correct one)</label>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <input type="radio" name={`mcq-correct-${q.id}`} checked={q.correctOptionIndex === optIdx} onChange={() => updateQuestion(q.id, 'correctOptionIndex', optIdx)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer" />
                        <input required type="text" value={opt} onChange={e => updateOption(q.id, optIdx, e.target.value)} className={`flex-1 rounded-lg border ${q.correctOptionIndex === optIdx ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500`} placeholder={`Option ${optIdx + 1}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <label>Expected Answer / Keywords (comma separated)</label>
                    <input required type="text" value={q.keywords} onChange={e => updateQuestion(q.id, 'keywords', e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. react, framework, javascript" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">Our auto-evaluator will check if the user's answer contains these keywords or is an exact match.</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => addQuestion('mcq')} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800">
              <Plus size={18} /> Add MCQ
            </button>
            <button type="button" onClick={() => addQuestion('short_answer')} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800">
              <Plus size={18} /> Add Short Answer
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium shadow-md transition-colors disabled:opacity-70">
            {isSubmitting ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <><Save size={20} /> Update Quiz</>}
          </button>
        </div>
      </form>
    </div>
  );
}
