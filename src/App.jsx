import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';

const Login = React.lazy(() => import('./pages/Auth/Login'));
const Signup = React.lazy(() => import('./pages/Auth/Signup'));
const Dashboard = React.lazy(() => import('./pages/User/Dashboard'));
const AdminDashboard = React.lazy(() => import('./pages/Admin/Dashboard'));
const CreateQuiz = React.lazy(() => import('./pages/Admin/CreateQuiz'));
const EditQuiz = React.lazy(() => import('./pages/Admin/EditQuiz'));
const QuizResults = React.lazy(() => import('./pages/Admin/QuizResults'));
const QuizAttempt = React.lazy(() => import('./pages/User/QuizAttempt'));
const Result = React.lazy(() => import('./pages/User/Result'));
const Leaderboard = React.lazy(() => import('./components/Leaderboard'));

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, userData, loading } = useAuthStore();
  
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && userData?.role !== 'admin') return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  const init = useAuthStore((state) => state.init);
  
  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <React.Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div></div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="attempt/:quizId" element={<ProtectedRoute><QuizAttempt /></ProtectedRoute>} />
            <Route path="result/:attemptId" element={<ProtectedRoute><Result /></ProtectedRoute>} />
            <Route path="leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/create" element={<ProtectedRoute requireAdmin><CreateQuiz /></ProtectedRoute>} />
            <Route path="admin/edit/:quizId" element={<ProtectedRoute requireAdmin><EditQuiz /></ProtectedRoute>} />
            <Route path="admin/results/:quizId" element={<ProtectedRoute requireAdmin><QuizResults /></ProtectedRoute>} />
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
