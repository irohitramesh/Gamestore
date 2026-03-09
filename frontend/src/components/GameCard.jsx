import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import './GameCard.css';

const GameCard = ({ game }) => {
    const [imgError, setImgError] = useState(false);
    const { isInWishlist, toggleWishlist } = useWishlist();
    const wishlisted = isInWishlist(game.id);

    const discountedPrice = game.discount
        ? (game.price - (game.price * (game.discount / 100))).toFixed(2)
        : game.price.toFixed(2);

    const fallbackCover = `https://placehold.co/400x225/1a1a2e/00d4ff?text=${encodeURIComponent(game.title)}&font=Inter`;

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="game-card"
            variants={cardVariants}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Link to={`/games/${game.id}`} className="game-card-link">
                <div className="game-image-container">
                    <img
                        src={imgError ? fallbackCover : (game.media_urls?.cover || fallbackCover)}
                        alt={game.title}
                        className="game-image"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                    <div className="card-image-overlay"></div>

                    {/* Wishlist Button */}
                    <button
                        className={`card-wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(game);
                        }}
                        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <Heart size={16} fill={wishlisted ? '#e74c3c' : 'none'} />
                    </button>

                    {/* Discount Badge on image */}
                    {game.discount > 0 && (
                        <span className="card-discount-overlay">-{game.discount}%</span>
                    )}
                </div>

                <div className="game-info">
                    <h3 className="game-title">{game.title}</h3>
                    <p className="game-subtitle">
                        {game.genre?.slice(0, 2).join(' • ') || 'Base Game'}
                    </p>

                    <div className="game-pricing">
                        {game.discount > 0 ? (
                            <>
                                <span className="discount-badge">-{game.discount}%</span>
                                <div className="price-col">
                                    <span className="original-price">${game.price.toFixed(2)}</span>
                                    <span className="current-price">${discountedPrice}</span>
                                </div>
                            </>
                        ) : (
                            <span className="current-price">${discountedPrice}</span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default GameCard;
