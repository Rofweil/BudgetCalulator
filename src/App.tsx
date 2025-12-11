import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import SalaryInputPage from './pages/SalaryInputPage';
import CommitmentPage from './pages/CommitmentPage';
import PartTimeDailyPage from './pages/PartTimeDailyPage';
import { Toaster } from 'sonner@2.0.3';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salary-input"
            element={
              <ProtectedRoute>
                <SalaryInputPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commitment"
            element={
              <ProtectedRoute>
                <CommitmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/part-time-daily"
            element={
              <ProtectedRoute>
                <PartTimeDailyPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}