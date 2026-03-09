import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import gamesData from '../data/gamesData';
import './Header.css';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { user, isAuthenticated, logout } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const searchRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsSearchFocused(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim().length > 0) {
            const results = gamesData.filter(game =>
                game.title.toLowerCase().includes(query.toLowerCase()) ||
                game.genre.some(g => g.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 6);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const handleSearchSelect = (gameId) => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchFocused(false);
        navigate(`/games/${gameId}`);
    };

    const handleLogout = async () => {
        setProfileMenuOpen(false);
        await logout();
        navigate('/');
    };

    // Hide header on login/signup pages
    if (location.pathname === '/login' || location.pathname === '/signup') {
        return null;
    }

    return (
        <header className="header" role="banner">
            <div className="header-left">
                <Link to="/" className="logo-link" aria-label="GameStore Home">
                    <span className="logo-icon" aria-hidden="true">🎮</span>
                    <span className="logo-text">GAMESTORE</span>
                </Link>
                <nav className="main-nav desktop-nav" aria-label="Main navigation">
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Store</Link>
                    <Link to="/games" className={location.pathname === '/games' ? 'active' : ''}>Browse</Link>
                    {isAuthenticated && (
                        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Library</Link>
                    )}
                </nav>
            </div>

            <div className="header-center" ref={searchRef}>
                <div className={`search-bar ${isSearchFocused ? 'focused' : ''}`} role="search">
                    <Search size={18} className="search-icon" aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search games..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        aria-label="Search games"
                        autoComplete="off"
                    />
                    {searchQuery && (
                        <button
                            className="search-clear"
                            onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {isSearchFocused && searchResults.length > 0 && (
                    <div className="search-dropdown" role="listbox" aria-label="Search results">
                        {searchResults.map(game => (
                            <div
                                key={game.id}
                                className="search-result-item"
                                onClick={() => handleSearchSelect(game.id)}
                                role="option"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchSelect(game.id)}
                            >
                                <div className="search-result-img">
                                    <img
                                        src={game.media_urls.cover}
                                        alt=""
                                        onError={(e) => { e.target.src = `https://placehold.co/60x34/1a1a2e/00d4ff?text=${encodeURIComponent(game.title.charAt(0))}`; }}
                                    />
                                </div>
                                <div className="search-result-info">
                                    <span className="search-result-title">{game.title}</span>
                                    <span className="search-result-price">
                                        {game.discount > 0 ? (
                                            <>${(game.price - (game.price * (game.discount / 100))).toFixed(2)}</>
                                        ) : (
                                            <>${game.price.toFixed(2)}</>
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isSearchFocused && searchQuery && searchResults.length === 0 && (
                    <div className="search-dropdown" role="status">
                        <div className="search-no-results">No games found for &ldquo;{searchQuery}&rdquo;</div>
                    </div>
                )}
            </div>

            <div className="header-right">
                <Link to="/wishlist" className="icon-btn" aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`} title="Wishlist">
                    <Heart size={20} />
                    {wishlistCount > 0 && <span className="badge" aria-hidden="true">{wishlistCount}</span>}
                </Link>

                <Link to="/cart" className="icon-btn" aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`} title="Cart">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && <span className="badge" aria-hidden="true">{cartCount}</span>}
                </Link>

                {isAuthenticated ? (
                    <div className="profile-dropdown-wrap" ref={profileRef}>
                        <button
                            className="profile-icon"
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                            aria-label="User menu"
                            aria-expanded={profileMenuOpen}
                            aria-haspopup="true"
                        >
                            <div className="profile-avatar-char">
                                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        </button>
                        {profileMenuOpen && (
                            <div className="profile-dropdown" role="menu">
                                <div className="profile-dropdown-header">
                                    <span className="profile-dropdown-name">{user?.displayName || 'User'}</span>
                                    <span className="profile-dropdown-email">{user?.email}</span>
                                </div>
                                <div className="profile-dropdown-divider"></div>
                                <button role="menuitem" onClick={() => { navigate('/dashboard'); setProfileMenuOpen(false); }}>
                                    <User size={16} aria-hidden="true" /> Dashboard
                                </button>
                                <button role="menuitem" onClick={handleLogout} className="logout-btn">
                                    <LogOut size={16} aria-hidden="true" /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="auth-nav-btn" aria-label="Sign in">
                        <LogIn size={18} aria-hidden="true" />
                        <span>Sign In</span>
                    </Link>
                )}

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {mobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} role="presentation">
                    <nav className="mobile-menu" onClick={e => e.stopPropagation()} aria-label="Mobile navigation">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Store</Link>
                        <Link to="/games" onClick={() => setMobileMenuOpen(false)}>Browse</Link>
                        {isAuthenticated && (
                            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Library</Link>
                        )}
                        <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
                        <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
                        {isAuthenticated ? (
                            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-logout-btn">
                                <LogOut size={16} /> Sign Out
                            </button>
                        ) : (
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-login-link">
                                <LogIn size={16} /> Sign In
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
