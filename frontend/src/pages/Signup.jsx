import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, UserPlus, User, AlertCircle } from 'lucide-react';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const { signup, authError, clearError } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const validate = () => {
        const errors = {};
        if (!displayName.trim()) errors.displayName = 'Display name is required.';
        else if (displayName.trim().length < 2) errors.displayName = 'Name must be at least 2 characters.';
        if (!email.trim()) errors.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email.';
        if (!password) errors.password = 'Password is required.';
        else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
        if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await signup(email, password, displayName.trim());
            navigate('/');
        } catch {
            // error is set in AuthContext
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page" role="main">
            <div className="auth-card" role="form" aria-label="Create a GameStore account">
                <div className="auth-header">
                    <div className="auth-logo" aria-hidden="true">🎮</div>
                    <h1 id="auth-heading">Create Account</h1>
                    <p className="auth-subtitle">Join GameStore today</p>
                </div>

                {authError && (
                    <div className="auth-error" role="alert" aria-live="assertive">
                        <AlertCircle size={18} aria-hidden="true" />
                        <span>{authError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate aria-labelledby="auth-heading">
                    <div className="form-group">
                        <label htmlFor="signup-name">
                            <User size={16} aria-hidden="true" /> Display Name
                        </label>
                        <input
                            id="signup-name"
                            type="text"
                            value={displayName}
                            onChange={(e) => { setDisplayName(e.target.value); clearError(); }}
                            placeholder="Enter your name"
                            autoComplete="name"
                            aria-required="true"
                            aria-invalid={!!formErrors.displayName}
                            aria-describedby={formErrors.displayName ? 'name-error' : undefined}
                        />
                        {formErrors.displayName && (
                            <span className="field-error" id="name-error" role="alert">{formErrors.displayName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-email">
                            <Mail size={16} aria-hidden="true" /> Email Address
                        </label>
                        <input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); clearError(); }}
                            placeholder="you@example.com"
                            autoComplete="email"
                            aria-required="true"
                            aria-invalid={!!formErrors.email}
                            aria-describedby={formErrors.email ? 'signup-email-error' : undefined}
                        />
                        {formErrors.email && (
                            <span className="field-error" id="signup-email-error" role="alert">{formErrors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-password">
                            <Lock size={16} aria-hidden="true" /> Password
                        </label>
                        <div className="password-wrapper">
                            <input
                                id="signup-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                aria-required="true"
                                aria-invalid={!!formErrors.password}
                                aria-describedby={formErrors.password ? 'signup-password-error' : undefined}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {formErrors.password && (
                            <span className="field-error" id="signup-password-error" role="alert">{formErrors.password}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-confirm">
                            <Lock size={16} aria-hidden="true" /> Confirm Password
                        </label>
                        <input
                            id="signup-confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            aria-required="true"
                            aria-invalid={!!formErrors.confirmPassword}
                            aria-describedby={formErrors.confirmPassword ? 'confirm-error' : undefined}
                        />
                        {formErrors.confirmPassword && (
                            <span className="field-error" id="confirm-error" role="alert">{formErrors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="spinner" aria-label="Creating account"></span>
                        ) : (
                            <>
                                <UserPlus size={18} aria-hidden="true" /> Create Account
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
