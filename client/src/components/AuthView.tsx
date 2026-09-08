import React, { useState } from 'react';
import { Shield, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { Department } from '../types';

interface AuthViewProps {
  onLogin: (email: string, password?: string) => Promise<void>;
  onRegister: (data: any) => Promise<void>;
  availableDepartments: Department[];
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onRegister,
  availableDepartments,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'INTERN' | 'TUTOR'>('INTERN');
  const [departmentSlug, setDepartmentSlug] = useState('cybersecurity');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (isRegister) {
        await onRegister({
          email,
          password,
          firstName,
          lastName,
          role,
          departmentSlug,
        });
      } else {
        await onLogin(email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setErrorMsg('');
    setLoading(true);
    try {
      await onLogin(demoEmail, 'password123');
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-brand">
          <div className="auth-logo-badge">
            <img src="/icons/icon-192.png" alt="Nexus" className="auth-logo-img" />
          </div>
          <h1 className="auth-brand-title">NEXUS</h1>
          <p className="auth-brand-subtitle">
            Centralized Tech Hub Workspace & Project Platform
          </p>
        </div>

        {/* Quick Demo Personas Box */}
        <div className="quick-demo-section">
          <div className="quick-demo-header">
            <Sparkles size={14} className="text-accent" />
            <span>Hackathon Quick-Login Personas:</span>
          </div>
          <div className="demo-pills-container">
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleQuickLogin('david.cyber@nexus.hub')}
            >
              <span className="demo-pill-dot cyber"></span>
              <span>David (Cyber Intern)</span>
            </button>

            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleQuickLogin('cyber.tutor@nexus.hub')}
            >
              <span className="demo-pill-dot cyber"></span>
              <span>Alex (Cyber Tutor)</span>
            </button>

            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleQuickLogin('sam.data@nexus.hub')}
            >
              <span className="demo-pill-dot data"></span>
              <span>Sam (Data Intern)</span>
            </button>

            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleQuickLogin('data.tutor@nexus.hub')}
            >
              <span className="demo-pill-dot data"></span>
              <span>Dr. Evelyn (Data Tutor)</span>
            </button>

            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleQuickLogin('admin@nexus.hub')}
            >
              <span className="demo-pill-dot admin"></span>
              <span>Sarah (Hub Director / Admin)</span>
            </button>
          </div>
        </div>

        {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Hub Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="e.g. intern@nexus.hub"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegister && (
            <>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Role</label>
                  <select
                    className="input-field"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                  >
                    <option value="INTERN">Intern</option>
                    <option value="TUTOR">Tutor / Instructor</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Primary Department</label>
                  <select
                    className="input-field"
                    value={departmentSlug}
                    onChange={(e) => setDepartmentSlug(e.target.value)}
                  >
                    {availableDepartments.map((d) => (
                      <option key={d.id} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="auth-footer-toggle">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="toggle-link"
                onClick={() => setIsRegister(false)}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New hub intern or instructor?{' '}
              <button
                type="button"
                className="toggle-link"
                onClick={() => setIsRegister(true)}
              >
                Register Here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
