import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingBag, Settings, Download, Play, User, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import gamesData from '../data/gamesData';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('library');
    const [libraryGameIds, setLibraryGameIds] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch user data from Firestore
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.uid) { setLoadingData(false); return; }
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setLibraryGameIds(data.library || []);
                    setOrders(data.orders || []);
                }
            } catch (err) {
                console.error('Error loading user data:', err);
            }
            setLoadingData(false);
        };
        fetchUserData();
    }, [user?.uid]);

    // Auth gate
    if (!isAuthenticated) {
        return (
            <div className="checkout-success-page" role="main">
                <div className="empty-cart-container">
                    <LogIn size={64} className="empty-icon" aria-hidden="true" />
                    <h2>Sign in Required</h2>
                    <p>Please sign in to access your dashboard.</p>
                    <button className="cta-btn" onClick={() => navigate('/login')} aria-label="Sign in to your account">
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    // Resolve game IDs to full game objects
    const ownedGames = gamesData.filter(g => libraryGameIds.includes(g.id));

    const tabs = [
        { id: 'library', label: 'My Library', icon: <BookOpen size={18} aria-hidden="true" /> },
        { id: 'orders', label: 'Transactions', icon: <ShoppingBag size={18} aria-hidden="true" /> },
        { id: 'profile', label: 'Settings', icon: <Settings size={18} aria-hidden="true" /> }
    ];

    return (
        <div className="dashboard-page" role="main">
            {/* Sidebar */}
            <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
                <div className="user-profile-summary">
                    <div className="avatar-wrapper">
                        <div className="profile-avatar-char-large">
                            {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    </div>
                    <h3>{user?.displayName || 'User'}</h3>
                    <p className="member-since">{user?.email}</p>
                    <div className="profile-stats">
                        <div className="stat">
                            <span className="stat-number">{ownedGames.length}</span>
                            <span className="stat-label">Games</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{orders.length}</span>
                            <span className="stat-label">Orders</span>
                        </div>
                    </div>
                </div>

                <nav className="dashboard-nav" aria-label="Dashboard tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`panel-${tab.id}`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Content */}
            <div className="dashboard-content">
                {loadingData ? (
                    <div className="tab-pane" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <div className="spinner-large" role="status" aria-label="Loading your data"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'library' && (
                            <motion.div
                                className="tab-pane"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                id="panel-library"
                                role="tabpanel"
                            >
                                <h2>My Library</h2>
                                <p className="tab-desc">Games you own. Click to view details.</p>

                                {ownedGames.length === 0 ? (
                                    <div className="empty-library">
                                        <BookOpen size={48} className="empty-icon" aria-hidden="true" />
                                        <h3>No games yet</h3>
                                        <p>Purchase games to see them here.</p>
                                        <button className="cta-btn" onClick={() => navigate('/games')}>Browse Store</button>
                                    </div>
                                ) : (
                                    <div className="library-grid">
                                        {ownedGames.map(game => (
                                            <motion.div
                                                key={game.id}
                                                className="library-item"
                                                whileHover={{ y: -4 }}
                                            >
                                                <div className="library-item-image" onClick={() => navigate(`/games/${game.id}`)}>
                                                    <img
                                                        src={game.media_urls.cover}
                                                        alt={`${game.title} cover art`}
                                                        onError={(e) => { e.target.src = `https://placehold.co/300x400/1a1a2e/00d4ff?text=${encodeURIComponent(game.title.charAt(0))}`; }}
                                                    />
                                                    <div className="library-overlay">
                                                        <Play size={32} aria-hidden="true" />
                                                    </div>
                                                </div>
                                                <div className="library-item-content">
                                                    <h4>{game.title}</h4>
                                                    <div className="library-actions">
                                                        <button className="cta-btn small library-play-btn" aria-label={`Play ${game.title}`}>
                                                            <Play size={14} aria-hidden="true" /> Play
                                                        </button>
                                                        <button className="cta-btn small secondary" aria-label={`Download ${game.title}`}>
                                                            <Download size={14} aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'orders' && (
                            <motion.div
                                className="tab-pane"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                id="panel-orders"
                                role="tabpanel"
                            >
                                <h2>Transaction History</h2>
                                {orders.length === 0 ? (
                                    <div className="empty-library">
                                        <ShoppingBag size={48} className="empty-icon" aria-hidden="true" />
                                        <h3>No transactions yet</h3>
                                        <p>Your purchase history will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="orders-list">
                                        {orders.slice().reverse().map((order, idx) => (
                                            <div key={idx} className="order-card" role="article" aria-label={`Order from ${new Date(order.date).toLocaleDateString()}`}>
                                                <div className="order-header">
                                                    <div className="order-id-group">
                                                        <span className="order-id">ORD-{String(orders.length - idx).padStart(3, '0')}</span>
                                                        <span className={`order-status ${order.status?.toLowerCase()}`}>{order.status}</span>
                                                    </div>
                                                    <span className="order-date">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                <div className="order-items">
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="order-item-row">
                                                            <span>{item.title}</span>
                                                            <span className="order-item-price">${item.finalPrice?.toFixed(2) || item.price?.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="order-footer">
                                                    <span>Total</span>
                                                    <span className="order-total">${order.total?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'profile' && (
                            <motion.div
                                className="tab-pane"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                id="panel-profile"
                                role="tabpanel"
                            >
                                <h2>Account Settings</h2>
                                <div className="settings-form">
                                    <div className="settings-section">
                                        <h3>Personal Information</h3>
                                        <div className="form-group">
                                            <label><User size={14} aria-hidden="true" /> Display Name</label>
                                            <input type="text" defaultValue={user?.displayName || ''} readOnly aria-label="Display name" />
                                        </div>
                                        <div className="form-group">
                                            <label><Mail size={14} aria-hidden="true" /> Email</label>
                                            <input type="email" defaultValue={user?.email || ''} readOnly aria-label="Email address" />
                                        </div>
                                    </div>

                                    <div className="settings-section">
                                        <h3>Account Details</h3>
                                        <div className="form-group">
                                            <label><Lock size={14} aria-hidden="true" /> User ID</label>
                                            <input type="text" defaultValue={user?.uid || ''} readOnly aria-label="User ID" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
