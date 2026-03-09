import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Grid, List } from 'lucide-react';
import GameCard from '../components/GameCard';
import gamesData from '../data/gamesData';
import './GameListing.css';

const ALL_GENRES = [...new Set(gamesData.flatMap(g => g.genre))].sort();

const GameListing = () => {
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [priceRange, setPriceRange] = useState('any');
    const [sortBy, setSortBy] = useState('featured');
    const [searchFilter, setSearchFilter] = useState('');
    const [showOnSale, setShowOnSale] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [showFilters, setShowFilters] = useState(true);

    const toggleGenre = (genre) => {
        setSelectedGenres(prev =>
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
    };

    const filteredGames = useMemo(() => {
        let result = [...gamesData];

        // Search filter
        if (searchFilter.trim()) {
            result = result.filter(g =>
                g.title.toLowerCase().includes(searchFilter.toLowerCase())
            );
        }

        // Genre filter
        if (selectedGenres.length > 0) {
            result = result.filter(g =>
                selectedGenres.some(genre => g.genre.includes(genre))
            );
        }

        // Price filter
        if (priceRange !== 'any') {
            result = result.filter(g => {
                const dp = g.discount > 0 ? g.price - (g.price * (g.discount / 100)) : g.price;
                switch (priceRange) {
                    case 'free': return dp === 0;
                    case 'under10': return dp < 10;
                    case 'under20': return dp < 20;
                    case 'under30': return dp < 30;
                    case 'above30': return dp >= 30;
                    default: return true;
                }
            });
        }

        // On sale filter
        if (showOnSale) {
            result = result.filter(g => g.discount > 0);
        }

        // Sort
        switch (sortBy) {
            case 'price_asc':
                result.sort((a, b) => {
                    const pa = a.discount > 0 ? a.price - (a.price * (a.discount / 100)) : a.price;
                    const pb = b.discount > 0 ? b.price - (b.price * (b.discount / 100)) : b.price;
                    return pa - pb;
                });
                break;
            case 'price_desc':
                result.sort((a, b) => {
                    const pa = a.discount > 0 ? a.price - (a.price * (a.discount / 100)) : a.price;
                    const pb = b.discount > 0 ? b.price - (b.price * (b.discount / 100)) : b.price;
                    return pb - pa;
                });
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
                break;
            case 'discount':
                result.sort((a, b) => b.discount - a.discount);
                break;
            default:
                break; // Keep original 'featured' order
        }

        return result;
    }, [selectedGenres, priceRange, sortBy, searchFilter, showOnSale]);

    const clearFilters = () => {
        setSelectedGenres([]);
        setPriceRange('any');
        setShowOnSale(false);
        setSearchFilter('');
    };

    const hasActiveFilters = selectedGenres.length > 0 || priceRange !== 'any' || showOnSale || searchFilter.trim();

    return (
        <div className="game-listing-page">
            {/* Filters Sidebar */}
            <aside className={`filters-sidebar ${showFilters ? 'open' : 'collapsed'}`}>
                <div className="filters-header">
                    <h3><SlidersHorizontal size={18} /> Filters</h3>
                    {hasActiveFilters && (
                        <button className="clear-filters-btn" onClick={clearFilters}>Clear All</button>
                    )}
                </div>

                <div className="filter-search">
                    <input
                        type="text"
                        placeholder="Filter by name..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <h4>Genre</h4>
                    <div className="filter-options genre-options">
                        {ALL_GENRES.map(genre => (
                            <label key={genre} className={selectedGenres.includes(genre) ? 'selected' : ''}>
                                <input
                                    type="checkbox"
                                    checked={selectedGenres.includes(genre)}
                                    onChange={() => toggleGenre(genre)}
                                />
                                <span>{genre}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-group">
                    <h4>Price</h4>
                    <div className="filter-options">
                        {[
                            { value: 'any', label: 'Any Price' },
                            { value: 'free', label: 'Free' },
                            { value: 'under10', label: 'Under $10' },
                            { value: 'under20', label: 'Under $20' },
                            { value: 'under30', label: 'Under $30' },
                            { value: 'above30', label: '$30 and Above' }
                        ].map(opt => (
                            <label key={opt.value} className={priceRange === opt.value ? 'selected' : ''}>
                                <input
                                    type="radio"
                                    name="price"
                                    checked={priceRange === opt.value}
                                    onChange={() => setPriceRange(opt.value)}
                                />
                                <span>{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-group">
                    <h4>Preferences</h4>
                    <label className={showOnSale ? 'selected' : ''}>
                        <input
                            type="checkbox"
                            checked={showOnSale}
                            onChange={(e) => setShowOnSale(e.target.checked)}
                        />
                        <span>On Sale Only</span>
                    </label>
                </div>
            </aside>

            {/* Listing Content */}
            <div className="listing-content">
                <div className="listing-header">
                    <div className="listing-header-left">
                        <h2>All Games</h2>
                        <span className="results-count">{filteredGames.length} result{filteredGames.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="listing-header-right">
                        <button
                            className="filter-toggle-btn"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal size={16} />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                        <div className="view-toggles">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                            </button>
                        </div>
                        <select
                            className="sort-dropdown"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="featured">Sort by: Featured</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                            <option value="newest">Newest First</option>
                            <option value="discount">Biggest Discount</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters Tags */}
                {hasActiveFilters && (
                    <div className="active-filters">
                        {selectedGenres.map(genre => (
                            <span key={genre} className="filter-tag" onClick={() => toggleGenre(genre)}>
                                {genre} ✕
                            </span>
                        ))}
                        {priceRange !== 'any' && (
                            <span className="filter-tag" onClick={() => setPriceRange('any')}>
                                {priceRange} ✕
                            </span>
                        )}
                        {showOnSale && (
                            <span className="filter-tag" onClick={() => setShowOnSale(false)}>
                                On Sale ✕
                            </span>
                        )}
                    </div>
                )}

                {filteredGames.length === 0 ? (
                    <div className="no-results">
                        <h3>No games found</h3>
                        <p>Try adjusting your filters or search terms.</p>
                        <button className="cta-btn secondary" onClick={clearFilters}>Clear Filters</button>
                    </div>
                ) : (
                    <motion.div
                        className={`games-grid ${viewMode === 'list' ? 'list-view' : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {filteredGames.map(game => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default GameListing;
