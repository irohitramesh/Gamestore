import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Monitor, Cpu, HardDrive, MemoryStick, ChevronLeft, Star, Tag, Calendar, Building, Globe, Check, Plus } from 'lucide-react';
import gamesData from '../data/gamesData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './GameDetail.css';

const GameDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, isInCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => {
        const found = gamesData.find(g => g.id === id);
        setGame(found || null);
        setLoading(false);
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="game-detail-loading">
                <div className="loading-pulse"></div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="game-detail-notfound">
                <h2>Game Not Found</h2>
                <p>The game you're looking for doesn't exist.</p>
                <button className="cta-btn" onClick={() => navigate('/games')}>Browse Games</button>
            </div>
        );
    }

    const discountedPrice = game.discount > 0
        ? (game.price - (game.price * (game.discount / 100))).toFixed(2)
        : game.price.toFixed(2);

    const alreadyInCart = isInCart(game.id);
    const wishlisted = isInWishlist(game.id);

    const handleAddToCart = () => {
        if (alreadyInCart) {
            navigate('/cart');
        } else {
            addToCart(game);
        }
    };

    const handleBuyNow = () => {
        if (!alreadyInCart) {
            addToCart(game);
        }
        navigate('/cart');
    };

    const fallbackCover = `https://placehold.co/1200x600/1a1a2e/00d4ff?text=${encodeURIComponent(game.title)}&font=Inter`;

    return (
        <motion.div
            className="game-detail-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {/* Back Button */}
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={20} />
                <span>Back</span>
            </button>

            {/* Hero Section */}
            <div className="detail-hero">
                <div className="hero-image-wrapper">
                    <img
                        src={imgError ? fallbackCover : game.media_urls.cover}
                        alt={game.title}
                        className="hero-cover-image"
                        onError={() => setImgError(true)}
                    />
                    <div className="hero-gradient-overlay"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="detail-content-grid">
                {/* Left - Game Info */}
                <div className="detail-main-col">
                    <div className="detail-title-block">
                        <h1 className="detail-game-title">{game.title}</h1>
                        <div className="detail-meta-row">
                            <span className="meta-item">
                                <Star size={14} className="star-icon" />
                                {game.rating}
                            </span>
                            <span className="meta-item">
                                <Calendar size={14} />
                                {new Date(game.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="meta-item">
                                <Building size={14} />
                                {game.developer}
                            </span>
                        </div>
                        <div className="genre-tags">
                            {game.genre.map(g => (
                                <span key={g} className="genre-tag">{g}</span>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="detail-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                            onClick={() => setActiveTab('about')}
                        >
                            About
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('specs')}
                        >
                            System Requirements
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                            onClick={() => setActiveTab('features')}
                        >
                            Features
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'about' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="about-section"
                            >
                                <p className="game-description">{game.description}</p>

                                <div className="detail-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Developer</span>
                                        <span className="info-value">{game.developer}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Publisher</span>
                                        <span className="info-value">{game.publisher}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Release Date</span>
                                        <span className="info-value">{new Date(game.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Platform</span>
                                        <span className="info-value">{game.platform?.join(', ')}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'specs' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="specs-section"
                            >
                                <h3>Minimum Requirements</h3>
                                <div className="specs-grid">
                                    <div className="spec-item">
                                        <Monitor size={20} className="spec-icon" />
                                        <div>
                                            <span className="spec-label">OS</span>
                                            <span className="spec-value">{game.system_requirements.os}</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <Cpu size={20} className="spec-icon" />
                                        <div>
                                            <span className="spec-label">Processor</span>
                                            <span className="spec-value">{game.system_requirements.processor}</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <MemoryStick size={20} className="spec-icon" />
                                        <div>
                                            <span className="spec-label">Memory</span>
                                            <span className="spec-value">{game.system_requirements.memory}</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <Monitor size={20} className="spec-icon" />
                                        <div>
                                            <span className="spec-label">Graphics</span>
                                            <span className="spec-value">{game.system_requirements.graphics}</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <HardDrive size={20} className="spec-icon" />
                                        <div>
                                            <span className="spec-label">Storage</span>
                                            <span className="spec-value">{game.system_requirements.storage}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'features' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="features-section"
                            >
                                <div className="features-grid">
                                    {game.features?.map(feature => (
                                        <div key={feature} className="feature-item">
                                            <Check size={18} className="feature-check" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right - Purchase Card */}
                <div className="detail-sidebar">
                    <div className="purchase-card">
                        <div className="purchase-card-image">
                            <img
                                src={imgError ? fallbackCover : game.media_urls.cover}
                                alt={game.title}
                                onError={() => setImgError(true)}
                            />
                        </div>

                        <div className="purchase-card-body">
                            <div className="price-block">
                                {game.discount > 0 && (
                                    <span className="discount-pill">-{game.discount}%</span>
                                )}
                                <div className="price-values">
                                    {game.discount > 0 && (
                                        <span className="original-price">${game.price.toFixed(2)}</span>
                                    )}
                                    <span className="final-price">${discountedPrice}</span>
                                </div>
                            </div>

                            <button
                                className={`cta-btn buy-now-btn ${alreadyInCart ? 'in-cart' : ''}`}
                                onClick={handleBuyNow}
                            >
                                {alreadyInCart ? 'Go to Cart' : 'Buy Now'}
                            </button>

                            <button
                                className={`cta-btn add-to-cart-btn ${alreadyInCart ? 'in-cart' : ''}`}
                                onClick={handleAddToCart}
                            >
                                {alreadyInCart ? (
                                    <>
                                        <Check size={18} />
                                        <span>In Cart</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        <span>Add to Cart</span>
                                    </>
                                )}
                            </button>

                            <button
                                className={`wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
                                onClick={() => toggleWishlist(game)}
                            >
                                <Heart size={18} fill={wishlisted ? '#e74c3c' : 'none'} />
                                <span>{wishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                            </button>

                            <div className="purchase-meta">
                                <div className="purchase-meta-item">
                                    <Globe size={14} />
                                    <span>Publisher: {game.publisher}</span>
                                </div>
                                <div className="purchase-meta-item">
                                    <Calendar size={14} />
                                    <span>Released: {new Date(game.releaseDate).toLocaleDateString()}</span>
                                </div>
                                <div className="purchase-meta-item">
                                    <Tag size={14} />
                                    <span>{game.genre.slice(0, 3).join(', ')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Games */}
            <section className="related-games-section">
                <h2>You May Also Like</h2>
                <div className="related-games-grid">
                    {gamesData
                        .filter(g => g.id !== game.id && g.genre.some(genre => game.genre.includes(genre)))
                        .slice(0, 4)
                        .map(relatedGame => {
                            const relPrice = relatedGame.discount > 0
                                ? (relatedGame.price - (relatedGame.price * (relatedGame.discount / 100))).toFixed(2)
                                : relatedGame.price.toFixed(2);
                            return (
                                <motion.div
                                    key={relatedGame.id}
                                    className="related-game-card"
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    onClick={() => navigate(`/games/${relatedGame.id}`)}
                                >
                                    <div className="related-image">
                                        <img
                                            src={relatedGame.media_urls.cover}
                                            alt={relatedGame.title}
                                            onError={(e) => { e.target.src = `https://placehold.co/400x225/1a1a2e/00d4ff?text=${encodeURIComponent(relatedGame.title)}&font=Inter`; }}
                                        />
                                    </div>
                                    <div className="related-info">
                                        <h4>{relatedGame.title}</h4>
                                        <div className="related-price">
                                            {relatedGame.discount > 0 && (
                                                <span className="discount-badge">-{relatedGame.discount}%</span>
                                            )}
                                            <span className="current-price">${relPrice}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                </div>
            </section>
        </motion.div>
    );
};

export default GameDetail;
