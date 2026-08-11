import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, storageService } from '../services/api';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Upload, 
  Check, 
  AlertCircle, 
  Loader2,
  FileText,
  ExternalLink
} from 'lucide-react';

const Settings = () => {
  const { user, updatePreferredToneState } = useAuth();
  
  const [tone, setTone] = useState(user?.preferredTone || 'Professional');
  const [toneLoading, setToneLoading] = useState(false);
  const [toneSuccess, setToneSuccess] = useState(false);
  const [toneError, setToneError] = useState('');

  // S3 Asset Upload State
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadError, setUploadError] = useState('');

  const tones = ['Professional', 'Friendly', 'Formal', 'Casual', 'Short', 'Polite'];

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setToneLoading(true);
    setToneSuccess(false);
    setToneError('');

    try {
      await userService.updatePreferences(tone);
      updatePreferredToneState(tone);
      setToneSuccess(true);
      setTimeout(() => setToneSuccess(false), 3000);
    } catch (err) {
      setToneError('Failed to update preferred tone.');
      console.error(err);
    } finally {
      setToneLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUploadError('');
      setUploadUrl('');
      
      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl('');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setUploadError('');
      setUploadUrl('');
      
      if (droppedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(droppedFile));
      } else {
        setPreviewUrl('');
      }
    }
  };

  const handleClearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');
    setUploadUrl('');

    try {
      const data = await storageService.upload(file);
      setUploadUrl(data.fileUrl || data.url || 'Upload successful!');
      setFile(null);
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'File upload failed. Ensure server & S3 configurations are active.'
      );
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your user profile, preferences, and S3 file configurations.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Left Column: Preferences & Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* User Profile Info */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <UserIcon size={18} color="var(--color-primary-light)" />
              <span>Profile Information</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Full Name</p>
                <p style={{ fontSize: '1rem', fontWeight: 550, marginTop: '2px' }}>{user?.name}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</p>
                <p style={{ fontSize: '1rem', fontWeight: 550, marginTop: '2px' }}>{user?.email}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Account Role</p>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--color-primary-light)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  marginTop: '4px'
                }}>{user?.role?.replace('ROLE_', '')}</span>
              </div>
            </div>
          </div>

          {/* Prompt Tone Preference */}
          <form onSubmit={handleUpdatePreferences} className="glass-card">
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <SettingsIcon size={18} color="var(--color-accent)" />
              <span>System Preferences</span>
            </h3>

            {toneSuccess && (
              <div className="alert alert-success">
                <Check size={16} />
                <span>Preferred tone updated successfully!</span>
              </div>
            )}
            
            {toneError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{toneError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Default Reply Tone</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                This tone will be pre-selected in the generator and the Chrome extension by default.
              </p>
              <select
                className="form-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                {tones.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={toneLoading}
              style={{ width: '100%', justifyContent: 'center', height: '42px', marginTop: '10px' }}
            >
              {toneLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>Save Preference</span>
            </button>
          </form>
        </div>

        {/* Right Column: S3 Asset Storage Tester */}
        <div className="glass-card" style={{ height: '100%' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Upload size={18} color="var(--color-secondary)" />
            <span>AWS S3 Asset Storage</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px' }}>
            Upload documentation, user avatars, or application assets directly to AWS S3 storage. 
          </p>

          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {uploadError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadUrl && (
              <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} />
                  <strong>Upload Successful!</strong>
                </div>
                <a 
                  href={uploadUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{
                    color: 'inherit',
                    fontSize: '0.8rem',
                    textDecoration: 'underline',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    wordBreak: 'break-all',
                    marginTop: '4px'
                  }}
                >
                  <span>Open Uploaded Asset</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Custom file drag and drop select */}
            <div 
              style={{
                border: isDragging ? '2px dashed var(--color-secondary)' : '2px dashed var(--border-muted)',
                borderRadius: '12px',
                padding: '35px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? 'rgba(6, 182, 212, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                boxShadow: isDragging ? '0 0 15px rgba(6, 182, 212, 0.1)' : 'none',
                transition: 'var(--transition-smooth)'
              }}
              onClick={() => document.getElementById('s3-file-input').click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                id="s3-file-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              
              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '8px', 
                        objectFit: 'cover', 
                        border: '1px solid var(--border-muted)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                  ) : (
                    <FileText size={36} color="var(--color-secondary)" />
                  )}
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all', padding: '0 10px' }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      marginTop: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                    }}
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Upload size={36} color={isDragging ? "var(--color-secondary)" : "var(--text-muted)"} style={{ transition: 'all 0.2s' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isDragging ? "Drop your file here!" : "Select file or drag & drop here"}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Supports images, PDFs, or documents up to 5MB
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-secondary"
              disabled={uploadLoading || !file}
              style={{
                justifyContent: 'center',
                height: '42px',
                background: file ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                borderColor: file ? 'rgba(6, 182, 212, 0.2)' : 'var(--border-muted)',
                color: file ? 'var(--color-secondary)' : 'var(--text-muted)'
              }}
            >
              {uploadLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading to S3...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload File</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
