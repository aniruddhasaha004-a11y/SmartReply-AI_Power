import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { replyService } from '../services/api';
import { 
  Sparkles, 
  History, 
  Settings, 
  MessageSquare, 
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  Mail
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await replyService.getHistory();
        setHistory(data);
      } catch (err) {
        setError('Failed to fetch reply history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalReplies = history.length;
  const recentReplies = history.slice(0, 3);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Panel */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
        border: '1px solid var(--border-glow)',
        borderRadius: '16px',
        padding: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
            Welcome, {user?.name || 'User'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Generate smart, context-aware email replies using AI models.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/generate')}
            style={{ height: '48px' }}
          >
            <Sparkles size={18} />
            <span>Quick Generate Reply</span>
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => window.open('https://mail.google.com', '_blank')}
            style={{ height: '48px', gap: '8px' }}
          >
            <Mail size={18} color="var(--color-primary-light)" />
            <span>Open Gmail</span>
          </button>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        {/* Total Replies Stat */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '16px',
            borderRadius: '12px',
            color: 'var(--color-primary-light)'
          }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Generated</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: '2px' }}>
              {loading ? <Loader2 size={24} className="animate-spin" /> : totalReplies}
            </p>
          </div>
        </div>

        {/* Preferred Tone Stat */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            padding: '16px',
            borderRadius: '12px',
            color: 'var(--color-accent)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Tone</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: '2px', color: 'var(--color-primary-light)' }}>
              {user?.preferredTone || 'Professional'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Replies & Quick Settings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Recent Replies List */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Recent Replies</h3>
            <button 
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary-light)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={() => navigate('/history')}
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 size={32} className="animate-spin" color="var(--color-primary)" />
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : recentReplies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <MessageSquare size={40} style={{ marginBottom: '12px', strokeWidth: 1.5 }} />
              <p>No replies generated yet. Start writing one!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentReplies.map((reply) => (
                <div 
                  key={reply.id} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                  onClick={() => navigate(`/history?id=${reply.id}`)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-glow)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-muted)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {reply.emailSubject}
                    </h4>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--color-primary-light)',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>{reply.selectedTone}</span>
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '8px'
                  }}>
                    {reply.generatedReply}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Help Tip */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Extension Integration</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '16px' }}>
            Did you know? You can generate replies directly in Gmail using our Chrome Extension. 
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Check size={16} color="var(--color-success)" />
              <span>Detects selected email context</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Check size={16} color="var(--color-success)" />
              <span>Inserts reply in a single click</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Check size={16} color="var(--color-success)" />
              <span>Keeps account preferences synced</span>
            </div>
          </div>
          <button
            className="btn-secondary"
            onClick={() => navigate('/settings')}
            style={{ width: '100%', marginTop: '20px', justifyContent: 'center', fontSize: '0.85rem' }}
          >
            <Settings size={14} />
            <span>Go to Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
