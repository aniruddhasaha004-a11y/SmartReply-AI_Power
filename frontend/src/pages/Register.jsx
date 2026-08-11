import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, AlertCircle, Loader2, Shield } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  // Icon focus states for micro-interactions
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [roleFocused, setRoleFocused] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingState(true);

    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        background: 'linear-gradient(135deg, rgba(13, 18, 30, 0.8) 0%, rgba(20, 27, 45, 0.6) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '45px 35px 35px 35px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative'
      }}>
        {/* Top brand edge accent glow */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--color-primary-light), var(--color-secondary), transparent)',
          zIndex: 1
        }} />

        {/* Brand/Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
            padding: '14px',
            borderRadius: '16px',
            marginBottom: '18px',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.35), 0 0 45px rgba(168, 85, 247, 0.15)',
          }}>
            <Mail size={28} color="#ffffff" />
          </div>
          <h2 style={{ 
            fontSize: '2.1rem', 
            fontFamily: 'var(--font-display)', 
            fontWeight: 800,
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join SmartReply to automate email replies</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '22px', borderRadius: '12px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem', letterSpacing: '0.08em' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <UserIcon 
                size={18} 
                color={nameFocused ? "var(--color-primary-light)" : "var(--text-muted)"} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  transition: 'color 0.3s ease'
                }} 
              />
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                required
                style={{ 
                  paddingLeft: '48px', 
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(9, 12, 22, 0.4)',
                  borderColor: nameFocused ? 'var(--color-primary)' : 'var(--border-muted)',
                  boxShadow: nameFocused ? '0 0 0 3px rgba(99, 102, 241, 0.12)' : 'none'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem', letterSpacing: '0.08em' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                color={emailFocused ? "var(--color-primary-light)" : "var(--text-muted)"} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  transition: 'color 0.3s ease'
                }} 
              />
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                required
                style={{ 
                  paddingLeft: '48px', 
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(9, 12, 22, 0.4)',
                  borderColor: emailFocused ? 'var(--color-primary)' : 'var(--border-muted)',
                  boxShadow: emailFocused ? '0 0 0 3px rgba(99, 102, 241, 0.12)' : 'none'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem', letterSpacing: '0.08em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                color={passwordFocused ? "var(--color-primary-light)" : "var(--text-muted)"} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  transition: 'color 0.3s ease'
                }} 
              />
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                minLength={6}
                style={{ 
                  paddingLeft: '48px', 
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(9, 12, 22, 0.4)',
                  borderColor: passwordFocused ? 'var(--color-primary)' : 'var(--border-muted)',
                  boxShadow: passwordFocused ? '0 0 0 3px rgba(99, 102, 241, 0.12)' : 'none'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem', letterSpacing: '0.08em' }}>Account Role</label>
            <div style={{ position: 'relative' }}>
              <Shield 
                size={18} 
                color={roleFocused ? "var(--color-primary-light)" : "var(--text-muted)"} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  transition: 'color 0.3s ease'
                }} 
              />
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onFocus={() => setRoleFocused(true)}
                onBlur={() => setRoleFocused(false)}
                style={{ 
                  paddingLeft: '48px', 
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(9, 12, 22, 0.4)',
                  borderColor: roleFocused ? 'var(--color-primary)' : 'var(--border-muted)',
                  boxShadow: roleFocused ? '0 0 0 3px rgba(99, 102, 241, 0.12)' : 'none'
                }}
              >
                <option value="USER">User (Standard Access)</option>
                <option value="ADMIN">Admin (All Access)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loadingState}
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              marginTop: '10px', 
              height: '44px',
              borderRadius: '12px',
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.25)'
            }}
          >
            {loadingState ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        {/* Footer Link & Disclaimer */}
        <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: 'var(--color-primary-light)',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'var(--transition-smooth)'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-primary-light)'}
            >
              Sign In
            </Link>
          </p>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.4', margin: 0, padding: '0 10px' }}>
            By registering, you agree to our <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
