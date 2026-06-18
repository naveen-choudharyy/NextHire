import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import CoverLetter from './pages/CoverLetter';

import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';
import PortfolioView from './pages/PortfolioView';
import AIInsights from './pages/AIInsights';
import SecurityCenter from './pages/SecurityCenter';

// Import Compliance Pages
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import RefundPolicy from './pages/RefundPolicy';

function App() {
  return (
    <Routes>
      {/* Public Landing & Auth Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      
      {/* Protected Dashboard & Feature Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/builder/:id"
        element={
          <ProtectedRoute>
            {/* Builder has its own custom toolbar/layout */}
            <Builder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cover-letter"
        element={
          <ProtectedRoute>
            <Layout>
              <CoverLetter />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <AIInsights />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <Layout>
              <SecurityCenter />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
      
      {/* Public Compliance Routes */}
      <Route path="/about" element={<Layout><AboutUs /></Layout>} />
      <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
      <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
      <Route path="/terms" element={<Layout><TermsAndConditions /></Layout>} />
      <Route path="/refund" element={<Layout><RefundPolicy /></Layout>} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Public Live Portfolio Route (isolated layout) */}
      <Route path="/portfolio/:slug" element={<PortfolioView />} />
    </Routes>
  );
}

export default App;
