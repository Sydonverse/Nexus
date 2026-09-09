import React, { useState } from 'react';
import { BookOpen, Sparkles, LogIn, UserPlus, ShieldCheck, GraduationCap } from 'lucide-react';
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
  const [departmentSlug, setDepartmentSlug] = useState(
    availableDepartments[0]?.slug || 'cybersecurity'
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!departmentSlug) {
          setErrorMsg('Please select your department during registration.');
          setLoading(false);
          return;
        }

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
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="auth-logo-badge">
            <BookOpen size={28} color="#ffffff" />
          </div>
          <h1 className="auth-brand-title">Knowvia</h1>
          <p className="auth-brand-subtitle">
            Progressive Knowledge Repository & Learning Management Platform
          </p>
        </div>

        {/* Quick Demo Personas Box */}
        <div className="quick-demo-section">
          <div className="quick-demo-header">
            <Sparkles size={14} color="#4f46e5" />
            <span>Quick-Login Demo Accounts:</span>
          </div>
          <div className="demo-pills-container">
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleQuickLogin('david.cyber@knowvia.internal')}
            >
              <span className="demo-pill-dot intern-dot"></span>
              <span>David (Student)</span>
            </button>

            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleQuickLogin('cyber.tutor@knowvia.internal')}
            >
              <span className="demo-pill-dot tutor-dot"></span>
              <span>Alex (Tutor)</span>
            </button>

            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleQuickLogin('admin@knowvia.internal')}
            >
              <span className="demo-pill-dot admin-dot"></span>
              <span>Sarah (Admin)</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
            }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
            }}
          >
            <UserPlus size={16} />
            <span>Register Account</span>
          </button>
        </div>

        {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="field-label">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-clean"
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-clean"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Department Enrollment *</label>
                <select
                  value={departmentSlug}
                  onChange={(e) => setDepartmentSlug(e.target.value)}
                  className="input-clean"
                  required
                >
                  {availableDepartments.length > 0 ? (
                    availableDepartments.map((dept) => (
                      <option key={dept.slug} value={dept.slug}>
                        {dept.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="cybersecurity">Cybersecurity</option>
                      <option value="web-dev">Web Development</option>
                      <option value="data-analysis">Data Analysis</option>
                      <option value="3d-modelling">3D Modelling</option>
                      <option value="graphic-design">Graphic Design</option>
                    </>
                  )}
                </select>
                <span className="field-help-text">
                  You will be enrolled into this department workspace upon registration.
                </span>
              </div>

              <div className="form-field">
                <label className="field-label">Role on Platform</label>
                <div className="role-selector-cards">
                  <label
                    className={`role-select-card ${role === 'INTERN' ? 'selected' : ''}`}
                    onClick={() => setRole('INTERN')}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="INTERN"
                      checked={role === 'INTERN'}
                      onChange={() => setRole('INTERN')}
                    />
                    <GraduationCap size={18} color="#10b981" />
                    <div>
                      <strong>Intern / Student</strong>
                      <div className="role-card-desc">Access timetable, materials & submit work</div>
                    </div>
                  </label>

                  <label
                    className={`role-select-card ${role === 'TUTOR' ? 'selected' : ''}`}
                    onClick={() => setRole('TUTOR')}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="TUTOR"
                      checked={role === 'TUTOR'}
                      onChange={() => setRole('TUTOR')}
                    />
                    <ShieldCheck size={18} color="#4f46e5" />
                    <div>
                      <strong>Department Tutor</strong>
                      <div className="role-card-desc">Schedule classes, upload files & review assignments</div>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="form-field">
            <label className="field-label">Email Address *</label>
            <input
              type="email"
              required
              placeholder="name@knowvia.internal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-clean"
            />
          </div>

          <div className="form-field">
            <label className="field-label">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-clean"
            />
          </div>

          <button type="submit" className="btn-primary btn-full mt-3" disabled={loading}>
            {loading
              ? 'Processing...'
              : isRegister
              ? 'Create Knowvia Account'
              : 'Sign In to Knowvia'}
          </button>
        </form>

        <div className="auth-footer-note">
          <span>Protected with cryptographic password hashing, JWT authorization, and file validation.</span>
        </div>
      </div>
    </div>
  );
};
