import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/home/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import GoogleCallback from './components/auth/GoogleCallback';
import PerfumeList from './components/perfumes/PerfumeList';
import PerfumeDetail from './components/perfumes/PerfumeDetail';
import ComparePerfumes from './components/compare/ComparePerfumes';
import TrendingPage from './components/trending/TrendingPage';
import DiscussionList from './components/discussions/DiscussionList';
import DiscussionDetail from './components/discussions/DiscussionDetail';
import AdminDashboard from './components/admin/AdminDashboard';
import Profile from './components/profile/Profile';
import MyReviews from './components/profile/MyReviews';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  return user && isAdmin ? children : <Navigate to="/" />;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/perfumes" element={<PerfumeList />} />
          <Route path="/perfumes/:id" element={<PerfumeDetail />} />
          <Route path="/compare" element={<ComparePerfumes />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/community" element={<DiscussionList />} />
          <Route path="/discussions/:id" element={<DiscussionDetail />} />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/my-reviews"
            element={<ProtectedRoute><MyReviews /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  );
}

export default App;
