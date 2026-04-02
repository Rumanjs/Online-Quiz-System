import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Trophy, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'leaderboard'),
          orderBy('score', 'desc'),
          orderBy('timeTaken', 'asc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaders(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-4 pb-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
          <Trophy className="h-12 w-12 text-yellow-600 dark:text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Global Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Top performers across all quizzes based on highest scores and fastest times.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Rank</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">User</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Quiz</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center">Score</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {leaders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">No entries yet. Be the first to take a quiz!</td>
                </tr>
              ) : (
                leaders.map((entry, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={entry.id} 
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' : index === 1 ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' : 'text-gray-500 font-medium'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{entry.userName}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 text-sm max-w-[200px] truncate" title={entry.quizTitle}>{entry.quizTitle}</td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center min-w-[3rem] gap-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded font-semibold text-sm">
                        <Target size={14} /> {entry.score}
                      </div>
                    </td>
                    <td className="p-4 text-right text-gray-600 dark:text-gray-400 font-mono text-sm">
                      <div className="flex justify-end items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" /> 
                        <span>{Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s</span>
                      </div>
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
