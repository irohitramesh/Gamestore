import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
    return context;
};

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loaded, setLoaded] = useState(false);

    // Load wishlist from Firestore when user changes
    useEffect(() => {
        const loadWishlist = async () => {
            if (user?.uid) {
                try {
                    const wishlistDoc = await getDoc(doc(db, 'wishlists', user.uid));
                    if (wishlistDoc.exists()) {
                        setWishlistItems(wishlistDoc.data().items || []);
                    } else {
                        setWishlistItems([]);
                    }
                } catch (err) {
                    console.error('Error loading wishlist:', err);
                    setWishlistItems([]);
                }
            } else {
                setWishlistItems([]);
            }
            setLoaded(true);
        };
        loadWishlist();
    }, [user?.uid]);

    // Save wishlist to Firestore whenever it changes
    useEffect(() => {
        if (!loaded || !user?.uid) return;
        const saveWishlist = async () => {
            try {
                await setDoc(doc(db, 'wishlists', user.uid), {
                    items: wishlistItems,
                    updatedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error('Error saving wishlist:', err);
            }
        };
        saveWishlist();
    }, [wishlistItems, user?.uid, loaded]);

    const addToWishlist = useCallback((game) => {
        setWishlistItems(prev => {
            const exists = prev.find(item => item.id === game.id);
            if (exists) return prev;
            return [...prev, { id: game.id, title: game.title, price: game.price, discount: game.discount, genre: game.genre, media_urls: game.media_urls }];
        });
    }, []);

    const removeFromWishlist = useCallback((gameId) => {
        setWishlistItems(prev => prev.filter(item => item.id !== gameId));
    }, []);

    const isInWishlist = useCallback((gameId) => {
        return wishlistItems.some(item => item.id === gameId);
    }, [wishlistItems]);

    const toggleWishlist = useCallback((game) => {
        if (isInWishlist(game.id)) {
            removeFromWishlist(game.id);
        } else {
            addToWishlist(game);
        }
    }, [isInWishlist, removeFromWishlist, addToWishlist]);

    const wishlistCount = wishlistItems.length;

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            wishlistCount,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
