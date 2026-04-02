import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, BookOpen, Eye, EyeOff, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(
          collection(db, 'quizzes'),
          where('createdBy', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedQuizzes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuizzes(fetchedQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user.uid]);

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        setQuizzes(quizzes.filter(q => q.id !== quizId));
      } catch (error) {
        console.error("Error deleting quiz:", error);
        alert("Failed to delete quiz.");
      }
    }
  };

  const handleToggleActive = async (quizId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'quizzes', quizId), { isActive: !currentStatus });
      setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, isActive: !currentStatus } : q));
    } catch (error) {
      console.error("Error updating quiz status:", error);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your quizzes and track performance.</p>
        </div>
        <Link 
          to="/admin/create" 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <PlusCircle size={20} /> Create New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No quizzes created yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first quiz.</p>
          <Link 
            to="/admin/create" 
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <PlusCircle size={20} /> Create Quiz
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              key={quiz.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1" title={quiz.title}>
                    {quiz.title}
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleActive(quiz.id, quiz.isActive)}
                      className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 transition-colors ${quiz.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
                      title={quiz.isActive ? "Deactivate Quiz" : "Activate Quiz"}
                    >
                      {quiz.isActive ? <Eye size={12} /> : <EyeOff size={12} />} {quiz.isActive ? 'Active' : 'Draft'}
                    </button>
                    <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded">
                      {quiz.questions?.length} Qs
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {quiz.description}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-auto">
                  <span>Time: {quiz.timeLimit} mins</span>
                  <span>{format(new Date(quiz.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between gap-3">
                <button 
                  onClick={() => navigate(`/admin/results/${quiz.id}`)}
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  <BarChart2 size={16} /> Results
                </button>
                <div className="flex items-center gap-3">
                  <Link to={`/admin/edit/${quiz.id}`} className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Edit">
                    <Edit size={18} />
                  </Link>
                  <button onClick={() => handleDelete(quiz.id)} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
