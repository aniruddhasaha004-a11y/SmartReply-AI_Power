import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { replyService } from '../services/api';
import { 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Save, 
  Check, 
  AlertCircle, 
  Loader2,
  Mail,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';

const ReplyGenerator = () => {
  const { user } = useAuth();
  
  // Input fields state
  const [subject, setSubject] = useState('');
  const [sender, setSender] = useState('');
  const [body, setBody] = useState('');
  const [tone, setTone] = useState(user?.preferredTone || 'Professional');
  
  // Execution status state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  const tonesList = [
    { name: 'Professional', desc: 'Clear, polite and business-focused' },
    { name: 'Friendly', desc: 'Warm, conversational and welcoming' },
    { name: 'Formal', desc: 'Dignified, corporate standard courtesy' },
    { name: 'Casual', desc: 'Relaxed, informal and direct' },
    { name: 'Short', desc: 'Minimalist, 1-3 sentences maximum' },
    { name: 'Polite', desc: 'Respectful, appreciative and courteous' }
  ];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!subject || !body) {
      setError('Please fill in both Email Subject and Email Body fields.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setCopied(false);
    setSavedStatus(false);

    try {
      const data = await replyService.generate(subject, body, sender, tone);
      setResult(data.generatedReply);
      setSavedStatus(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating AI reply. Please check connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>AI Reply Generator</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Draft customized responses instantly based on your target email parameters.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Input Panel */}
        <form onSubmit={handleGenerate} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div className="form-group">
              <label className="form-label">Sender Info</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hiring Manager, Client"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Subject</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Schedule Interview"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Body (Context)</label>
            <textarea
              className="form-input"
              rows={6}
              placeholder="Paste the content of the email you want to reply to..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              style={{ resize: 'vertical', minHeight: '120px' }}
            />
          </div>

          {/* Tone Grid Selection */}
          <div className="form-group">
            <label className="form-label">Select Reply Tone</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px'
            }}>
              {tonesList.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setTone(t.name)}
                  style={{
                    background: tone === t.name ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)' : 'rgba(255, 255, 255, 0.02)',
                    border: tone === t.name ? '1px solid var(--color-primary-light)' : '1px solid var(--border-muted)',
                    color: tone === t.name ? '#ffffff' : 'var(--text-secondary)',
                    borderRadius: '10px',
                    padding: '12px 8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'var(--transition-smooth)',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    if (tone !== t.name) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (tone !== t.name) {
                      e.currentTarget.style.borderColor = 'var(--border-muted)';
                    }
                  }}
                >
                  <p style={{ fontSize: '0.9rem', marginBottom: '2px' }}>{t.name}</p>
                  <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                    {t.name === 'Short' ? 'Brief' : t.name === 'Polite' ? 'Gracious' : t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', height: '48px', marginTop: '10px' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Generating Smart Reply...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Reply</span>
              </>
            )}
          </button>
        </form>

        {/* Output Panel */}
        <div className="glass-card" style={{
          minHeight: '445px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: result ? 'space-between' : 'center',
          alignItems: result ? 'stretch' : 'center',
          padding: '24px',
          background: result ? 'var(--bg-card)' : 'rgba(255, 255, 255, 0.01)',
          borderStyle: result ? 'solid' : 'dashed'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <Loader2 size={48} className="animate-spin" color="var(--color-primary-light)" style={{ marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Drafting context-aware reply using Gemini...</p>
            </div>
          ) : result ? (
            <>
              {/* Output Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} color="var(--color-success)" />
                    <span>AI Generated Draft</span>
                  </h3>
                  {savedStatus && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-success)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Save size={12} />
                      <span>Saved to DB</span>
                    </span>
                  )}
                </div>
                
                <textarea
                  className="form-input"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  style={{
                    flexGrow: 1,
                    height: '270px',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderColor: 'var(--border-muted)',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginTop: '20px'
              }}>
                <button className="btn-secondary" onClick={handleCopy} style={{ justifyContent: 'center' }}>
                  {copied ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy Reply'}</span>
                </button>
                <button className="btn-secondary" onClick={() => handleGenerate()} style={{ justifyContent: 'center' }}>
                  <RefreshCw size={16} />
                  <span>Regenerate</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <Sparkles size={48} style={{ marginBottom: '16px', strokeWidth: 1.2, color: 'var(--text-muted)' }} />
              <p style={{ fontSize: '0.95rem' }}>Your AI generated reply will appear here.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Fill in details on the left and click "Generate".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplyGenerator;
