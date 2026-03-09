import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Wishlist.css';

const Wishlist = () => {
    const navigate = useNavigate();
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart, isInCart } = useCart();

    if (wishlistItems.length === 0) {
        return (
            <div className="wishlist-page empty-wishlist">
                <div className="empty-state">
                    <Heart size={64} className="empty-icon" />
                    <h2>Your Wishlist is Empty</h2>
                    <p>Games you add to your wishlist will appear here.</p>
                    <button className="cta-btn" onClick={() => navigate('/games')}>Browse Games</button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="wishlist-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="wishlist-header">
                <h1>My Wishlist</h1>
                <span className="wishlist-count">{wishlistItems.length} {wishlistItems.length === 1 ? 'Game' : 'Games'}</span>
            </div>

            <div className="wishlist-grid">
                <AnimatePresence>
                    {wishlistItems.map(game => {
                        const discountedPrice = game.discount > 0
                            ? (game.price - (game.price * (game.discount / 100))).toFixed(2)
                            : game.price.toFixed(2);
                        const inCart = isInCart(game.id);

                        return (
                            <motion.div
                                key={game.id}
                                className="wishlist-item"
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <div className="wishlist-item-image" onClick={() => navigate(`/games/${game.id}`)}>
                                    <img
                                        src={game.media_urls.cover}
                                        alt={game.title}
                                        onError={(e) => { e.target.src = `https://placehold.co/400x225/1a1a2e/00d4ff?text=${encodeURIComponent(game.title)}&font=Inter`; }}
                                    />
                                    {game.discount > 0 && (
                                        <span className="wishlist-discount">-{game.discount}%</span>
                                    )}
                                </div>

                                <div className="wishlist-item-info">
                                    <h3 onClick={() => navigate(`/games/${game.id}`)}>{game.title}</h3>
                                    <p className="wishlist-genre">{game.genre.slice(0, 3).join(' • ')}</p>

                                    <div className="wishlist-price-row">
                                        {game.discount > 0 && (
                                            <span className="original-price">${game.price.toFixed(2)}</span>
                                        )}
                                        <span className="current-price">${discountedPrice}</span>
                                    </div>

                                    <div className="wishlist-actions">
                                        <button
                                            className={`cta-btn small ${inCart ? 'in-cart-btn' : ''}`}
                                            onClick={() => inCart ? navigate('/cart') : addToCart(game)}
                                        >
                                            <ShoppingCart size={16} />
                                            {inCart ? 'In Cart' : 'Add to Cart'}
                                        </button>
                                        <button
                                            className="remove-wishlist-btn"
                                            onClick={() => removeFromWishlist(game.id)}
                                            aria-label="Remove from wishlist"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Wishlist;
