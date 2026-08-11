import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Sparkles, 
  History, 
  Settings, 
  LogOut, 
  Mail 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/generate', label: 'AI Generator', icon: Sparkles },
    { path: '/history', label: 'History', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'rgba(10, 15, 26, 0.95)',
      borderRight: '1px solid var(--border-muted)',
      backdropFilter: 'var(--glass-blur)',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* App Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <Mail size={22} color="#ffffff" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.35rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em'
          }}>SmartReply</span>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.12) 0%, rgba(0, 255, 102, 0.04) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid transparent',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'var(--transition-smooth)'
                })}
                onMouseOver={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!e.currentTarget.getAttribute('style').includes('rgba(0, 240, 255, 0.12)')) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>{user?.name || 'User'}</p>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{
            width: '100%',
            padding: '10px',
            justifyContent: 'center',
            fontSize: '0.9rem',
            background: 'rgba(244, 63, 94, 0.05)',
            borderColor: 'rgba(244, 63, 94, 0.1)',
            color: 'var(--color-error)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.1)';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
