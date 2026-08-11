import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReplyGenerator from './pages/ReplyGenerator';
import ReplyHistory from './pages/ReplyHistory';
import Settings from './pages/Settings';
import { Bot } from 'lucide-react';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--border-muted)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main Layout Wrapper for Authenticated Pages
const AppLayout = ({ children }) => {
  const location = useLocation();
  const [showBubble, setShowBubble] = useState(true);

  // Context-aware messages from the guide robot
  let botMessage = "System fully operational. Ready to draft!";
  if (location.pathname === '/') {
    botMessage = "[SYS-ACTIVE]: This is your dashboard. Track email stats and recent drafts here.";
  } else if (location.pathname === '/generate') {
    botMessage = "[COG-DRAFT]: Input the email body, choose a tone, and I'll generate the response.";
  } else if (location.pathname === '/history') {
    botMessage = "[ARCHIVE-QUERY]: Here is the record of your generated replies. Click to copy or review.";
  } else if (location.pathname === '/settings') {
    botMessage = "[CONFIG-MODE]: Adjust your default tones here. Local storage fallback is active!";
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden' }}>
      {/* Drifting background glow element */}
      <div className="glow-bg-mid" />
      
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main style={{
        marginLeft: 'var(--sidebar-width)',
        flexGrow: 1,
        padding: '40px',
        minWidth: 0,
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* Floating Robo-Guide */}
      <div className="floating-bot-container">
        {showBubble && (
          <div className="bot-bubble animate-fade-in">
            {botMessage}
          </div>
        )}
        <div 
          className="bot-avatar" 
          onClick={() => setShowBubble(!showBubble)}
          title="Click to toggle guide helper"
        >
          <Bot size={22} color="var(--color-primary)" />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/generate" element={
            <ProtectedRoute>
              <AppLayout>
                <ReplyGenerator />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <AppLayout>
                <ReplyHistory />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Redirect/Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
