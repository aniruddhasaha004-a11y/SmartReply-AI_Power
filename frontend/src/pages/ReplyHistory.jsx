import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { replyService } from '../services/api';
import { 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2, 
  Mail, 
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';

const ReplyHistory = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReply, setSelectedReply] = useState(null);
  
  const [copied, setCopied] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await replyService.getHistory();
      setHistory(data);
      
      // Auto-highlight query param if it exists
      if (highlightId && data.length > 0) {
        const item = data.find(r => r.id === highlightId);
        if (item) setSelectedReply(item);
      }
    } catch (err) {
      setError('Failed to load reply history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid selecting card
    if (!window.confirm('Are you sure you want to delete this reply from history?')) return;
    
    setDeleteLoading(id);
    try {
      await replyService.deleteById(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedReply && selectedReply.id === id) {
        setSelectedReply(null);
      }
    } catch (err) {
      alert('Failed to delete history item.');
      console.error(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Local Search Filter
  const filteredHistory = history.filter(reply => {
    const query = searchQuery.toLowerCase();
    return (
      reply.emailSubject.toLowerCase().includes(query) ||
      (reply.sender && reply.sender.toLowerCase().includes(query)) ||
      reply.generatedReply.toLowerCase().includes(query)
    );
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header & Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Reply History</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View, copy, or manage previously generated responses.</p>
        </div>
        
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={18} color="var(--text-muted)" style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search subject or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '42px', height: '42px' }}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
          <Mail size={48} style={{ marginBottom: '16px', strokeWidth: 1.2, color: 'var(--text-muted)' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No historical entries found.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
            {searchQuery ? 'Try adjusting your search filters.' : 'Your generation history will compile here.'}
          </p>
        </div>
      ) : (
        /* Split view layout */
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedReply ? '1fr 1.2fr' : '1fr',
          gap: '30px',
          transition: 'var(--transition-smooth)'
        }}>
          
          {/* History List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredHistory.map((reply) => (
              <div
                key={reply.id}
                className="glass-card"
                onClick={() => setSelectedReply(reply)}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: selectedReply?.id === reply.id ? 'var(--color-primary-light)' : 'var(--border-muted)',
                  background: selectedReply?.id === reply.id ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.03) 100%)' : 'var(--bg-card)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
              >
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--color-primary-light)',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>{reply.selectedTone}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {reply.emailSubject}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                    {reply.generatedReply}
                  </p>
                </div>

                <button
                  className="btn-danger"
                  disabled={deleteLoading === reply.id}
                  onClick={(e) => handleDelete(reply.id, e)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    flexShrink: 0
                  }}
                >
                  {deleteLoading === reply.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Details Drawer */}
          {selectedReply && (
            <div className="glass-card animate-fade-in" style={{
              position: 'sticky',
              top: '20px',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxHeight: '70vh',
              overflowY: 'auto'
            }}>
              {/* Detail Header */}
              <div style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>{selectedReply.emailSubject}</h2>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
                    onClick={() => setSelectedReply(null)}
                  >
                    ×
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {selectedReply.sender && (
                    <span><strong>Sender:</strong> {selectedReply.sender}</span>
                  )}
                  <span><strong>Tone:</strong> {selectedReply.selectedTone}</span>
                  <span><strong>Created:</strong> {new Date(selectedReply.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Original Context */}
              <div>
                <h4 className="form-label" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>Original Email Context</h4>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  lineHeight: '1.5'
                }}>
                  {selectedReply.originalEmail}
                </div>
              </div>

              {/* Generated Output */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                <h4 className="form-label" style={{ fontSize: '0.75rem' }}>Generated Reply</h4>
                <div style={{
                  background: 'rgba(99, 102, 241, 0.03)',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  minHeight: '180px',
                  fontFamily: 'inherit'
                }}>
                  {selectedReply.generatedReply}
                </div>
              </div>

              {/* Copy action */}
              <button 
                className="btn-primary" 
                onClick={() => handleCopy(selectedReply.generatedReply)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ReplyHistory;
