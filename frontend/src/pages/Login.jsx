import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, authError, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const validate = () => {
        const errors = {};
        if (!email.trim()) errors.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email.';
        if (!password) errors.password = 'Password is required.';
        else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/');
        } catch {
            // error is set in AuthContext
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page" role="main">
            <div className="auth-card" role="form" aria-label="Sign in to GameStore">
                <div className="auth-header">
                    <div className="auth-logo" aria-hidden="true">🎮</div>
                    <h1 id="auth-heading">Sign In</h1>
                    <p className="auth-subtitle">Welcome back to GameStore</p>
                </div>

                {authError && (
                    <div className="auth-error" role="alert" aria-live="assertive">
                        <AlertCircle size={18} aria-hidden="true" />
                        <span>{authError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate aria-labelledby="auth-heading">
                    <div className="form-group">
                        <label htmlFor="login-email">
                            <Mail size={16} aria-hidden="true" /> Email Address
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); clearError(); }}
                            placeholder="you@example.com"
                            autoComplete="email"
                            aria-required="true"
                            aria-invalid={!!formErrors.email}
                            aria-describedby={formErrors.email ? 'email-error' : undefined}
                        />
                        {formErrors.email && (
                            <span className="field-error" id="email-error" role="alert">{formErrors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">
                            <Lock size={16} aria-hidden="true" /> Password
                        </label>
                        <div className="password-wrapper">
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                aria-required="true"
                                aria-invalid={!!formErrors.password}
                                aria-describedby={formErrors.password ? 'password-error' : undefined}
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
                            <span className="field-error" id="password-error" role="alert">{formErrors.password}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="spinner" aria-label="Signing in"></span>
                        ) : (
                            <>
                                <LogIn size={18} aria-hidden="true" /> Sign In
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-switch">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="auth-link">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
