import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Tag } from 'lucide-react';
import GameCard from '../components/GameCard';
import gamesData from '../data/gamesData';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [heroIndex, setHeroIndex] = useState(0);
    const heroTimerRef = useRef(null);

    // Curated sections from the game data
    const heroGames = gamesData.filter(g => g.tags?.includes('Featured') || g.tags?.includes('New Release')).slice(0, 5);
    const newReleases = gamesData.filter(g => g.tags?.includes('New Release') || g.tags?.includes('Popular')).slice(0, 8);
    const bestDeals = gamesData.filter(g => g.discount >= 40).sort((a, b) => b.discount - a.discount).slice(0, 8);
    const topRated = gamesData.filter(g => g.rating >= 4.7).sort((a, b) => b.rating - a.rating).slice(0, 8);
    const underTwenty = gamesData.filter(g => {
        const dp = g.discount > 0 ? g.price - (g.price * (g.discount / 100)) : g.price;
        return dp < 20;
    }).slice(0, 4);

    // Auto-rotate hero
    useEffect(() => {
        if (heroGames.length === 0) return;
        heroTimerRef.current = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % heroGames.length);
        }, 5000);
        return () => clearInterval(heroTimerRef.current);
    }, [heroGames.length]);

    const heroGame = heroGames[heroIndex] || gamesData[0];
    const heroPrice = heroGame?.discount > 0
        ? (heroGame.price - (heroGame.price * (heroGame.discount / 100))).toFixed(2)
        : heroGame?.price?.toFixed(2);

    const changeHero = (dir) => {
        clearInterval(heroTimerRef.current);
        setHeroIndex(prev => {
            if (dir === 'next') return (prev + 1) % heroGames.length;
            return prev === 0 ? heroGames.length - 1 : prev - 1;
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    return (
        <div className="home-page">
            {/* Hero Carousel */}
            {heroGame && (
                <section className="hero-carousel">
                    <motion.div
                        className="hero-slide"
                        key={heroGame.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="hero-bg">
                            <img
                                src={heroGame.media_urls.cover}
                                alt={heroGame.title}
                                onError={(e) => { e.target.src = `https://placehold.co/1400x600/1a1a2e/00d4ff?text=${encodeURIComponent(heroGame.title)}&font=Inter`; }}
                            />
                            <div className="hero-overlay"></div>
                        </div>
                        <div className="hero-info">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {heroGame.title}
                            </motion.h1>
                            <motion.p
                                className="hero-desc"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {heroGame.description?.slice(0, 150)}...
                            </motion.p>
                            <motion.div
                                className="hero-price-row"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {heroGame.discount > 0 && (
                                    <span className="hero-discount">-{heroGame.discount}%</span>
                                )}
                                <span className="hero-price">${heroPrice}</span>
                                <button className="cta-btn hero-cta" onClick={() => navigate(`/games/${heroGame.id}`)}>
                                    View Game
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Carousel Controls */}
                    <button className="hero-nav hero-prev" onClick={() => changeHero('prev')}>
                        <ChevronLeft size={24} />
                    </button>
                    <button className="hero-nav hero-next" onClick={() => changeHero('next')}>
                        <ChevronRight size={24} />
                    </button>

                    {/* Dots */}
                    <div className="hero-dots">
                        {heroGames.map((_, i) => (
                            <button
                                key={i}
                                className={`hero-dot ${i === heroIndex ? 'active' : ''}`}
                                onClick={() => { clearInterval(heroTimerRef.current); setHeroIndex(i); }}
                            />
                        ))}
                    </div>

                    {/* Hero Thumbnails */}
                    <div className="hero-thumbnails">
                        {heroGames.map((g, i) => (
                            <div
                                key={g.id}
                                className={`hero-thumb ${i === heroIndex ? 'active' : ''}`}
                                onClick={() => { clearInterval(heroTimerRef.current); setHeroIndex(i); }}
                            >
                                <img
                                    src={g.media_urls.cover}
                                    alt={g.title}
                                    onError={(e) => { e.target.src = `https://placehold.co/120x68/1a1a2e/00d4ff?text=${encodeURIComponent(g.title.charAt(0))}`; }}
                                />
                                <span>{g.title}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Sale Banner */}
            <motion.section
                className="promo-banner"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className="promo-content">
                    <Tag size={28} />
                    <div>
                        <h2>Spring Sale</h2>
                        <p>Up to 80% off on hundreds of games</p>
                    </div>
                    <button className="cta-btn promo-cta" onClick={() => navigate('/games')}>Browse Deals</button>
                </div>
            </motion.section>

            {/* Top Deals */}
            <section className="listing-section">
                <div className="section-header">
                    <h2>🔥 Top Deals</h2>
                    <button className="see-all-btn" onClick={() => navigate('/games')}>See All →</button>
                </div>
                <motion.div
                    className="games-grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {bestDeals.map(game => (
                        <GameCard key={`deal-${game.id}`} game={game} />
                    ))}
                </motion.div>
            </section>

            {/* New Releases */}
            <section className="listing-section">
                <div className="section-header">
                    <h2>🆕 New & Trending</h2>
                    <button className="see-all-btn" onClick={() => navigate('/games')}>See All →</button>
                </div>
                <motion.div
                    className="games-grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {newReleases.map(game => (
                        <GameCard key={`new-${game.id}`} game={game} />
                    ))}
                </motion.div>
            </section>

            {/* Top Rated */}
            <section className="listing-section">
                <div className="section-header">
                    <h2>⭐ Top Rated</h2>
                    <button className="see-all-btn" onClick={() => navigate('/games')}>See All →</button>
                </div>
                <motion.div
                    className="games-grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {topRated.map(game => (
                        <GameCard key={`top-${game.id}`} game={game} />
                    ))}
                </motion.div>
            </section>

            {/* Under $20 */}
            {underTwenty.length > 0 && (
                <section className="listing-section">
                    <div className="section-header">
                        <h2>💰 Under $20</h2>
                        <button className="see-all-btn" onClick={() => navigate('/games')}>See All →</button>
                    </div>
                    <motion.div
                        className="games-grid"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {underTwenty.map(game => (
                            <GameCard key={`cheap-${game.id}`} game={game} />
                        ))}
                    </motion.div>
                </section>
            )}
        </div>
    );
};

export default Home;
